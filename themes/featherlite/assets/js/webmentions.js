(function (r, isComment) {
  "use strict";

  // Shim i18next
  window.i18next = window.i18next || {
    t: function t(/** @type {string} */ key) {
      return key;
    },
  };
  const t = window.i18next.t.bind(window.i18next);

  /**
   * Read the configuration value.
   *
   * @param {string} key The configuration key.
   * @param {string} dfl The default value.
   * @returns {string}
   */
  function getCfg(key, dfl) {
    console.log("getCfg", document.currentScript.getAttribute("data-" + key));
    return document.currentScript.getAttribute("data-" + key) || dfl;
  }

  const refurl = getCfg("page-url", window.location.href.replace(/#.*$/, ""));
  const addurls = getCfg("add-urls", undefined);
  const containerID = getCfg("id", "webmentions");
  /** @type {Number} */
  const textMaxWords = getCfg("wordcount");
  const maxWebmentions = getCfg("max-webmentions", 30);
  const mentionSource = getCfg("prevent-spoofing") ? "wm-source" : "url";
  const sortBy = getCfg("sort-by", "published");
  const sortDir = getCfg("sort-dir", "up");
  /** @type {boolean} */
  const commentsAreReactions = getCfg("comments-are-reactions", true);

  /**
   * @typedef MentionType
   * @type {"in-reply-to"|"like-of"|"repost-of"|"bookmark-of"|"mention-of"|"rsvp"|"follow-of"}
   */

  /**
   * Maps a reaction to a hover title.
   *
   * @type {Record<MentionType, string>}
   */
  const reactTitle = {
    "in-reply-to": t("replied"),
    "like-of": t("liked"),
    "repost-of": t("reposted"),
    "bookmark-of": t("bookmarked"),
    "mention-of": t("mentioned"),
    rsvp: t("RSVPed"),
    "follow-of": t("followed"),
  };

  const reactIcon = {
    "in-reply-to": getCfg("in-reply-to-icon", undefined),
  };

  /**
   * Maps a reaction to an emoji.
   *
   * @type {Record<MentionType, string>}
   */
  const reactEmoji = {
    "in-reply-to": "💬",
    "like-of": "❤️",
    "repost-of": "🔄",
    "bookmark-of": "⭐️",
    "mention-of": "💬",
    rsvp: "📅",
    "follow-of": "🐜",
  };

  /**
   * @typedef RSVPEmoji
   * @type {"yes"|"no"|"interested"|"maybe"|null}
   */

  /**
   * Maps a RSVP to an emoji.
   *
   * @type {Record<RSVPEmoji, string>}
   */
  const rsvpEmoji = {
    yes: "✅",
    no: "❌",
    interested: "💡",
    maybe: "💭",
  };

  /**
   * HTML escapes the string.
   *
   * @param {string} text The string to be escaped.
   * @returns {string}
   */
  function entities(text) {
    return text.replace(
      /[&<>"]/g,
      (tag) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
        })[tag] || tag,
    );
  }

  /**
   * Creates the markup for an reaction image.
   *
   * @param {Reaction} r
   * @param {boolean} isComment
   * @returns {Promise<HTMLAnchorElement>}
   */
  async function reactImage(r, isComment) {
    const who = entities(r.author?.name || r.url.split("/")[2]);
    /** @type {string} */
    let response = reactTitle[r["wm-property"]] || t("reacted");
    if (!isComment && r.content && r.content.text) {
      response += ": " + (await extractComment(r));
    }

    const authorPhoto = document.createElement("img");
    authorPhoto.classList.add("author-photo");
    if (r.author && r.author.photo) {
      authorPhoto.src = entities(r.author.photo);
      authorPhoto.loading = "lazy";
      authorPhoto.decoding = "async";
      authorPhoto.alt = who;
    } else {
      authorPhoto.src =
        "data:image/webp;base64,UklGRkoCAABXRUJQVlA4TD4CAAAvP8APAIV0WduUOLr/m/iqY6SokDJSMD5xYX23SQizRsVdZmIj/f6goYUbiOj/BED7MOPReuBNT3vBesSzIex+SeqMFFkjebFmzH3S7POxDSJ1yaCbCmMnS2R46cRMPyQLw4GBK4esdK60pYwsZakecUCl5zsHv/5cPH08nx9/7i6rEEVCg2hR8VSd30PxMZpVoJZQO6Dixgg6X5oKFCmlVHIDmmMFShWumAXgCuyqVN8hHff/k+9fj8+ei7BVjpxBmZCUJv+6DhWGZwWvs+UoLHFCKsPYpfJtIcEXBTopEEsKwedZUv4ku1FZErKULLyQwFGgnmTs2vBD5qu44xwnG9uyjgrFOd+KRVlXyQfwQlauydaU6AVI7OjKXLUEqNtxJBmQegNDZgV7lxxqYMOMrDyC1NdAGbdiH9Ij0skjG+oTyfO0lmjdgvoH8iIgreuBMRYLSH+R3sAztXgL+XfS7E2bmfo6gnS0TrpnzHT7kL+skj7PgHuBwv/zpN8LDLQg7zfJZLBubMKnyeh6ZGyfDEfc2LYpnlUtG7JqsSHq1WoASbUS4KVaLwB8be5mfsGMDwBcm5VxbuxWxx3nkFanB6lYqsqSkOGkKicoDvXsneR7BkKU7DtaEuT7+pxBGVwx+9gVyqf2pVA9sC2CsmjZ1RJqEJHS4Tj/pCcS0JoyBYOsB91Xjh3OFfQPQhvCAYyeLJlaOoFp0XNNuD0BC8exr8uPx7D1JWkwFdZIXmD3MOPReuDNzHjBesSzIbQD";
      authorPhoto.alt = who;
      authorPhoto.classList.add("missing-photo");
    }

    let rsvp = "";
    if (r.rsvp && rsvpEmoji[r.rsvp]) {
      rsvp = `<sub>${rsvpEmoji[r.rsvp]}</sub>`;
    }

    const link = document.createElement("a");
    link.classList.add("reaction");
    link.rel = "nofollow ugc";
    link.title = `${who} ${response}`;
    link.href = r[mentionSource];
    link.append(authorPhoto);
    const emoji = document.createElement("span");
    emoji.classList.add("emoji");
    emoji.textContent = reactIcon[r["wm-property"]] || reactEmoji[r["wm-property"]] || "💥";
    link.append(emoji);
    link.append(authorPhoto, emoji, rsvp);
    return link;
  }

  /**
   * Strip the protocol off a URL.
   *
   * @param {string} url The URL to strip protocol off.
   * @returns {string}
   */
  function stripurl(url) {
    return url.substring(url.indexOf("//"));
  }

  /**
   * Deduplicate multiple mentions from the same source URL.
   *
   * @param {Array<Reaction>} mentions Mentions of the source URL.
   * @return {Array<Reaction>}
   */
  function dedupe(mentions) {
    /** @type {Array<Reaction>} */
    const filtered = [];
    /** @type {Record<string, boolean>} */
    const seen = {};

    mentions.forEach(function (r) {
      // Strip off the protocol (i.e. treat http and https the same)
      const source = stripurl(r.url);
      if (!seen[source]) {
        filtered.push(r);
        seen[source] = true;
      }
    });

    return filtered;
  }

  /**
   * Extract comments from a reaction.
   *
   * @param {Reaction} c
   * @returns Promise<string>
   */
  async function extractComment(c) {
    let text = entities(c.content.text);

    if (textMaxWords) {
      let words = text.replace(/\s+/g, " ").split(" ", textMaxWords + 1);
      if (words.length > textMaxWords) {
        words[textMaxWords - 1] += "&hellip;";
        words = words.slice(0, textMaxWords);
        text = words.join(" ");
      }
    }

    return text;
  }

  async function formatComment(c) {
    const image = reactImage(c, true);
    let source = entities(c.url.split("/")[2]);
    if (c.author && c.author.name) {
      source = entities(c.author.name);
    }
    const link = document.createElement("a");
    link.classList.add("source");
    link.rel = "nofollow ugc";
    link.href = c[mentionSource];
    link.textContent = source;

    let linkclass = "name";
    let linktext = `(${t("mention")})`;
    if (c.name) {
      linkclass = "name";
      linktext = entities(c.name);
    } else if (c.content && c.content.text) {
      linkclass = "text";
      linktext = await extractComment(c);
    }
    const type = document.createElement("blockquote");
    type.classList.add(linkclass);
    type.innerHTML = linktext;

    const li = document.createElement("li");
    li.append(await image, type, link);
    return li;
  }

  async function fetchWebmentions(path) {
    path = stripurl(path);
    const httpUrl = encodeURIComponent("http:" + path);
    const httpsUrl = encodeURIComponent("https:" + path);
    const apiURL = `https://webmention.io/api/mentions.jf2?per-page=${maxWebmentions}&sort-by=${sortBy}&sort-dir=${sortDir}&target[]=${httpUrl}&target[]=${httpsUrl}`;

    /** @type {WebmentionResponse} */
    return window.fetch(apiURL).catch((error) => {
      console.error("Error fetching webmentions for", path, error);
    });
  }

  /**
   * Format comments as HTML.
   *
   * @param {Array<Reaction>} comments The comments to format.
   * @returns Promise<Array<HTMLElement>>
   */
  async function formatComments(comments) {
    const formattedComments = Promise.all(comments.map(async (c) => formatComment(c)));
    const headline = document.createElement("h3");
    const ul = document.createElement("ul");
    ul.classList.add("comments");
    ul.innerHTML = (await formattedComments).map((el) => el.outerHTML).join("");
    headline.textContent = `${(await formattedComments).length} ${t("Responses")}`;
    return [headline, ul];
  }

  async function formatReactions(reacts) {
    const formattedReactions = Promise.all(
      reacts.map(async (r) => {
        const img = await reactImage(r, false);
        const li = document.createElement("li");
        li.append(img);
        return li;
      }),
    );

    const headline = document.createElement("h3");
    headline.textContent = `${(await formattedReactions).length} ${t("Reactions")}`;

    const ul = document.createElement("ul");
    ul.classList.add("reacts");
    ul.innerHTML = (await formattedReactions).map((el) => el.outerHTML).join("");
    return [headline, ul];
  }

  /**
   * @typedef WebmentionResponse
   * @type {Object}
   * @property {Array<Reaction>} children
   */

  /**
   * Register event listener.
   */
  window.addEventListener("load", async function () {
    const container = document.getElementById(containerID);
    if (!container) {
      // no container, so do nothing
      return;
    }

    const pages = [refurl];
    if (addurls) {
      pages.push(...addurls.split("|"));
    }

    const jsonResponses = pages.map(async (path) => fetchWebmentions(path).then((response) => response.json()));

    const json = await Promise.all(jsonResponses).then((responses) => {
      const merged = {
        children: [],
      };
      responses.forEach((response) => {
        merged.children = merged.children.concat(response.children);
      });
      return merged;
    });

    /** @type {Array<Reaction>} */
    let comments = [];
    /** @type {Array<Reaction>} */
    const collects = [];

    if (commentsAreReactions) {
      comments = collects;
    }

    /** @type {Record<MentionType, Array<Reaction>>} */
    const mapping = {
      "in-reply-to": comments,
      "like-of": collects,
      "repost-of": collects,
      "bookmark-of": collects,
      "follow-of": collects,
      "mention-of": comments,
      rsvp: comments,
    };

    json.children.forEach(function (child) {
      // Map each mention into its respective container
      const store = mapping[child["wm-property"]];
      if (store) {
        store.push(child);
      }
    });

    const formattedComments = await formatComments(dedupe(comments));
    const formattedReactions = await formatReactions(dedupe(collects));

    container.append(...formattedReactions, ...formattedComments);
  });
})();

// End-of-file marker for LibreJS
// @license-end
