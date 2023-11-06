module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-critical');
    grunt.initConfig({
        critical: {
            public: {
                options: {
                    base: './public',
                    dimensions: [
                        {width: 1920, height: 1080},
                        {width: 1366, height: 768},
                        {width: 1440, height: 900},
                        {width: 1280, height: 720},
                        {width: 1280, height: 1024},
                        {width: 360, height: 800},
                        {width: 390, height: 844},
                        {width: 414, height: 896},
                        {width: 393, height: 873},
                        {width: 412, height: 915}
                    ],
                    inline: {
                        strategy: "swap"
                    }
                },
                src: 'public/**/*.html',
                dest: 'public/'
            }
        }
    });
};