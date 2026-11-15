/* =========================================================
   faq.js — SEARCH AND TOPICS ON THE FAQ PAGE
   The questions open and close by themselves (<details>).
   This file only adds:
     1. Topic buttons: show one group of questions
     2. Search: show the questions that contain the words,
        open them and highlight the words
     3. "No questions found" when nothing matches
     4. A link like faq.html#couriers opens on that topic
   ========================================================= */

(function () {
    const searchInput = document.getElementById("faqSearch");
    const chips = document.querySelectorAll(".faq-chip");
    const groups = document.querySelectorAll(".faq-group");
    const items = document.querySelectorAll(".faq-item");
    const emptyBox = document.getElementById("faqEmpty");
    const clearButton = document.getElementById("faqClear");

    let currentCategory = "all";

    // Keep each answer's original HTML, so highlights can be removed later
    items.forEach(function (item) {
        item.dataset.original = item.innerHTML;
    });

    /* ---------- Highlight the searched words ----------
       Goes through the text pieces of the question (not the
       tags), and wraps each match in <mark>. */
    function highlight(element, words) {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const textNodes = [];
        while (walker.nextNode()) {
            textNodes.push(walker.currentNode);
        }
        // e.g. words ["price", "kg"] -> /(price|kg)/gi
        const escaped = words.map(function (word) {
            return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        });
        const pattern = new RegExp("(" + escaped.join("|") + ")", "gi");

        textNodes.forEach(function (node) {
            if (!pattern.test(node.textContent)) {
                return;
            }
            pattern.lastIndex = 0;
            const piece = document.createElement("span");
            piece.innerHTML = node.textContent
                .replace(/&/g, "&amp;").replace(/</g, "&lt;")
                .replace(pattern, "<mark>$1</mark>");
            node.replaceWith(...piece.childNodes);
        });
    }

    /* ---------- Show the right questions ---------- */
    function update() {
        const text = searchInput.value.trim().toLowerCase();
        const words = text.split(/\s+/).filter(function (word) {
            return word.length > 1;
        });
        let shown = 0;

        groups.forEach(function (group) {
            const inCategory = currentCategory === "all" || group.dataset.category === currentCategory;
            let shownInGroup = 0;

            group.querySelectorAll(".faq-item").forEach(function (item) {
                item.innerHTML = item.dataset.original;         // remove old highlights
                const content = item.textContent.toLowerCase();
                const matches = words.every(function (word) {
                    return content.includes(word);
                });
                const visible = inCategory && matches;

                item.hidden = !visible;
                if (visible) {
                    shownInGroup += 1;
                    if (words.length > 0) {
                        item.open = true;                       // show the answer that matched
                        highlight(item, words);
                    }
                }
            });

            group.hidden = shownInGroup === 0;
            shown += shownInGroup;
        });

        emptyBox.hidden = shown > 0;
    }

    /* ---------- 1. Topic buttons ---------- */
    function chooseCategory(category) {
        currentCategory = category;
        chips.forEach(function (chip) {
            chip.setAttribute("aria-pressed", String(chip.dataset.category === category));
        });
        update();
    }

    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            chooseCategory(chip.dataset.category);
        });
    });

    /* ---------- 2. Search (updates while typing) ---------- */
    searchInput.addEventListener("input", update);

    /* ---------- 3. "Show all questions" ---------- */
    clearButton.addEventListener("click", function () {
        searchInput.value = "";
        items.forEach(function (item) {
            item.open = false;
        });
        chooseCategory("all");
        searchInput.focus();
    });

    /* ---------- 4. faq.html#couriers opens that topic ---------- */
    function openFromLink() {
        const fromLink = window.location.hash.replace("#", "");
        if (["orders", "tracking", "accounts", "couriers"].includes(fromLink)) {
            chooseCategory(fromLink);
        }
    }
    openFromLink();
    window.addEventListener("hashchange", openFromLink);    // link clicked while already on the page
})();
