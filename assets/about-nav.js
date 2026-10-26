(function () {
  var OPEN_MS = 150;
  var CLOSE_MS = 180;
  var hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

  function canHover() {
    return hoverQuery.matches;
  }

  function controls(root) {
    return {
      button: root.querySelector(".pdx-about-caret"),
      link: root.querySelector(".pdx-about-link")
    };
  }

  function setExpanded(root, open) {
    var ui = controls(root);
    var value = open ? "true" : "false";
    if (ui.button) ui.button.setAttribute("aria-expanded", value);
    if (ui.link) ui.link.setAttribute("aria-expanded", value);
  }

  function openMenu(root) {
    window.clearTimeout(root._pdxOpen);
    window.clearTimeout(root._pdxClose);
    root.classList.add("is-open");
    root.classList.remove("is-dismissed");
    setExpanded(root, true);
  }

  function closeMenu(root) {
    window.clearTimeout(root._pdxOpen);
    window.clearTimeout(root._pdxClose);
    root.classList.remove("is-open");
    setExpanded(root, false);
  }

  document.querySelectorAll("[data-aboutnav]").forEach(function (root) {
    var ui = controls(root);
    var dismissing = false;
    var openedByFocus = false;
    var openBeforePointer = false;

    root.addEventListener("mouseenter", function () {
      if (!canHover()) return;
      window.clearTimeout(root._pdxClose);
      window.clearTimeout(root._pdxOpen);
      root._pdxOpen = window.setTimeout(function () { openMenu(root); }, OPEN_MS);
    });

    root.addEventListener("mouseleave", function () {
      if (!canHover()) return;
      window.clearTimeout(root._pdxOpen);
      root._pdxClose = window.setTimeout(function () { closeMenu(root); }, CLOSE_MS);
    });

    root.addEventListener("focusin", function () {
      if (dismissing || root.classList.contains("is-dismissed")) return;
      if (!root.classList.contains("is-open")) openedByFocus = true;
      openMenu(root);
    });

    root.addEventListener("focusout", function (event) {
      if (root.contains(event.relatedTarget)) return;
      openedByFocus = false;
      root.classList.remove("is-dismissed");
      closeMenu(root);
    });

    root.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      dismissing = true;
      openedByFocus = false;
      root.classList.add("is-dismissed");
      closeMenu(root);
      if (ui.button) ui.button.focus();
      dismissing = false;
    });

    if (ui.button) {
      ui.button.addEventListener("pointerdown", function () {
        openBeforePointer = root.classList.contains("is-open");
      });
      ui.button.addEventListener("click", function (event) {
        var fromKeyboard = event.detail === 0;
        var shouldClose = fromKeyboard ? root.classList.contains("is-open") : openBeforePointer;
        if (!canHover() && openedByFocus && !fromKeyboard) {
          openedByFocus = false;
          openMenu(root);
          return;
        }
        if (shouldClose) {
          openedByFocus = false;
          root.classList.add("is-dismissed");
          closeMenu(root);
        } else {
          openMenu(root);
        }
      });
    }

    if (ui.link) {
      ui.link.addEventListener("click", function (event) {
        if (canHover() || event.detail === 0) {
          openedByFocus = false;
          root.classList.add("is-dismissed");
          closeMenu(root);
          return;
        }
        if (!root.classList.contains("is-open") || openedByFocus) {
          openedByFocus = false;
          event.preventDefault();
          openMenu(root);
          return;
        }
        closeMenu(root);
      });
    }

    var menu = root.querySelector(".pdx-about-menu");
    if (menu) {
      menu.addEventListener("click", function (event) {
        if (event.target.closest("a")) closeMenu(root);
      });
    }
  });

  document.addEventListener("click", function (event) {
    document.querySelectorAll("[data-aboutnav].is-open").forEach(function (root) {
      if (root.contains(event.target)) return;
      closeMenu(root);
    });
  });
})();
