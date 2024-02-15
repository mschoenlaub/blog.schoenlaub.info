---
title: Yes, sir!
date: 2022-03-05
description: A little story about the Unix command yes
cover:
  src: cover.jpg
  caption: turned on white YES LED signage, Julian Lonzano
tags:
  - linux
author: mschoenlaub
series:
  - coreutils
---

What's the simplest Unix command you know?
For once there's `echo`, which prints a string to stdout and `true`, which always terminates with an exit code of zero.
<!--more-->

Among these simple Unix commands, there's also `yes`. If you execute it without arguments, you get an infinite stream of y's, separated by a newline:

```
y
y
y
y
(...you get the idea)
```

But what's the use of this command? Well, here's one one example:

```shell
yes | sh boring_installation.sh
```

Ever installed a program, which required you to type "y" and hit enter to keep going? yes to the rescue! It will carefully fulfill its duty, so you can keep playing Solitaire.

## Writing a yes clone

It must be pretty easy to write a yes clone, right? Let's try it in Python:

```python
while True:
    print("y")
```

This works, but it's not really efficient.

```shell
python yes.py | pv -r > /dev/null
[6.21MiB/s]
```

Let's try it in Go:

```go {title="yes_simple.go"}
package main

import "os"

func main() {
	for {
		os.Stdout.Write([]byte("y\n"))
	}
}
```

```shell
go build yes.go
./yes | pv -r > /dev/null
[1.30MiB/s]
```

That doesn't look any better. It's even slower than the Python version!
Looking at the source code of [GNU coreutils] (https://github.com/coreutils/coreutils/commits/master/src/yes.c), we can see this:

```c
while (full_write (STDOUT_FILENO, buf, bufused) == bufused)
  continue;
```

So they simply use a buffer to make the write operations faster. The buffer size is defined by a constant named `BUFSIZ`, which gets chosen on each system so as to make I/O efficient.
On my system, this is 1KB.
Let's try to implement this in Go:

```go {title="yes_buffered.go"}
package main

import (
    "fmt"
    "os"
)

func main() {
    buf := bytes.Repeat([]byte("y\n"), 1024*4)
    for {
        n, err := os.Stdout.Write(buf)
        if err != nil {
            panic(err)
        }
        if n != len(buf) {
            panic("short write")
        }
    }
}
```
This will create one buffer of 8KB, which is filled with y's and flushed to stdout in every iteration of the loop.
This means that each time we do the syscall, we will write 8KB instead of just 2 bytes, which should save us some overhead of calling into the kernel and also copying memory between kernel and user space.

```shell
go build yes.go
./yes | pv -r > /dev/null
[2.31GiB/s]
```

Looks better. But we can still improve on that - in terms of raw throughput.

### Enter vectorized I/O

The `writev` function, short for ["write a vector"](https://pubs.opengroup.org/onlinepubs/9699919799/), is a system call in Unix-like operating systems that enables the efficient writing of multiple non-contiguous buffers to a file descriptor in a single operation.
This system call is particularly valuable in situations where data is scattered across different memory locations, as it allows for improved performance and reduced overhead compared to multiple separate write operations.
By accepting an array of `iovec` structures, each describing a distinct buffer and its length, `writev` streamlines the process of assembling and transmitting diverse data chunks,
making it a powerful tool for optimizing I/O performance in various applications.

On my Mac, I had to jump through a few hoops to get this to work in a future-proof way, because Go deprecated the syscall package in favor of 
`golang.org/x/sys/unix`, which for reasons of ABI compatibility wraps `libc` functions instead of directly doing syscalls.

I'm planning to also write a tutorial on how to add a syscall to Go, but for now, just [take a look at the code of the changelist](https://go-review.googlesource.com/c/sys/+/548795).
If you want to play with it, check the code out, and adapt the go module path like so:

```go.mod {title="go.mod"}
require golang.org/x/sys v0.15.0
replace golang.org/x/sys => /Users/<username>/go/src/golang.org/x/sys
```

Now we can use the `Writev` syscall in Go:

```go {title="yes_iovec.go"}
package main

func main() {
	iov_max, err := sysconf.Sysconf(sysconf.SC_IOV_MAX)
	if err != nil {
		panic(err)
	}
	buf := make([]byte, unix.Getpagesize())
	iovecs := make([][]byte, 0, 1024)
	totalLen := 0
	if len(os.Args) < 2 {
		totalLen = fill(buf, yes)
	} else {
		totalLen = fill(buf, os.Args[1:]...)
	}
	for i := 0; i < int(iov_max); i++ {
		iovecs = append(iovecs, buf[0:totalLen])
	}
	for {
		_, err := unix.Writev(unix.Stdout, iovecs)
		if err != nil && err != unix.EAGAIN && err != unix.EINTR {
			fmt.Printf("writev: %v\n", err)
			os.Exit(1)
		}
	}
}

func fill(buf []byte, filler ...string) int {
	itemSize := 0
	for _, f := range filler {
		itemSize += len(f)
	}
	itemSize += len(filler)
	i := 0
	for i = 0; i+itemSize < len(buf); {
		for _, f := range filler {
			copy(buf[i:], f)
			i += len(f)
			buf[i] = ' '
			i++
		}
		buf[i-1] = '\n'
	}
	return i
}
```

```shell
go build yes.go
./yes | pv -r > /dev/null
[3.71GiB/s]
```

Now why is that faster? Well, the `writev` syscall can write multiple buffers in one syscall.
Because our (stack-allocated) buffer still fills only 8K, but is now referenced from 1024 `Iovec` structs, we can write 8MB in one syscall.
Isn't that cool? 

## Lessons learned
`writev` and friends are a great way to improve performance of I/O-bound applications, even when using contiguously allocated buffers.
There are a few drawback though: For starters, `writev` is not necessarily available on any all platforms.
Additionally, the time to first byte is a bit higher now, because we have to fill the buffer first.

So, while this was an interesting learning experience, especially regarding implementing syscall wrappers for Go, I think there's hardly a use case for printing gigabytes of y's to stdout in the shortest amount of time.
