/* ═══════════════════════════════════════════════════
   Sprout Design System / Chat Messages
   Reusable interactivity for chat threads.
   - Auto-decorates every .msg-bubble-in (incoming bubble) with
     a .msg-actions row containing copy / thumbs-up / thumbs-down icons.

   Pair with /kid-design-system/components/chat-messages.css.

   Usage:
     <script src="/kid-design-system/components/chat-messages.js"></script>
     <script>initChatMessages();</script>

   Or pass options:
     initChatMessages({
       scope: '#chatThread',     // CSS selector to scope decoration (default: document)
       onCopy: function(text) { ... },     // optional copy callback
       onThumbUp: function(text) { ... },  // optional
       onThumbDown: function(text) { ... } // optional
     });
   ═══════════════════════════════════════════════════ */

(function () {
  var ICON_COPY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 15C4.06812 15 3.60218 15 3.23463 14.8478C2.74458 14.6448 2.35523 14.2554 2.15224 13.7654C2 13.3978 2 12.9319 2 12V5.2C2 4.0799 2 3.51984 2.21799 3.09202C2.40974 2.7157 2.7157 2.40974 3.09202 2.21799C3.51984 2 4.0799 2 5.2 2H12C12.9319 2 13.3978 2 13.7654 2.15224C14.2554 2.35523 14.6448 2.74458 14.8478 3.23463C15 3.60218 15 4.06812 15 5M12.2 22H18.8C19.9201 22 20.4802 22 20.908 21.782C21.2843 21.5903 21.5903 21.2843 21.782 20.908C22 20.4802 22 19.9201 22 18.8V12.2C22 11.0799 22 10.5198 21.782 10.092C21.5903 9.7157 21.2843 9.40974 20.908 9.21799C20.4802 9 19.9201 9 18.8 9H12.2C11.0799 9 10.5198 9 10.092 9.21799C9.7157 9.40974 9.40974 9.7157 9.21799 10.092C9 10.5198 9 11.0799 9 12.2V18.8C9 19.9201 9 20.4802 9.21799 20.908C9.40974 21.2843 9.7157 21.5903 10.092 21.782C10.5198 22 11.0799 22 12.2 22Z"/></svg>';
  var ICON_THUMBS_UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 22V11M2 13V20C2 21.1046 2.89543 22 4 22H17.4262C18.907 22 20.1662 20.9197 20.3914 19.4562L21.4683 12.4562C21.7479 10.6389 20.3418 9 18.5032 9H15C14.4477 9 14 8.55228 14 8V4.46584C14 3.10399 12.896 2 11.5342 2C11.2093 2 10.915 2.1913 10.7831 2.48812L7.26394 10.4061C7.10344 10.7673 6.74532 11 6.35013 11H4C2.89543 11 2 11.8954 2 13Z"/></svg>';
  var ICON_THUMBS_DOWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2V13M22 11V4C22 2.89543 21.1046 2 20 2H6.57383C5.09301 2 3.83382 3.08034 3.60862 4.54379L2.53168 11.5438C2.25212 13.3611 3.65822 15 5.49688 15H9C9.55228 15 10 15.4477 10 16V19.5342C10 20.896 11.104 22 12.4658 22C12.7907 22 13.085 21.8087 13.2169 21.5119L16.7361 13.5939C16.8966 13.2327 17.2547 13 17.6499 13H20C21.1046 13 22 12.1046 22 11Z"/></svg>';

  function makeActionsRow(text, opts) {
    var row = document.createElement('div');
    row.className = 'msg-actions';

    function btn(svg, label, handler) {
      var b = document.createElement('button');
      b.className = 'msg-actions-btn';
      b.setAttribute('aria-label', label);
      b.innerHTML = svg;
      if (handler) b.addEventListener('click', handler);
      return b;
    }

    row.appendChild(btn(ICON_COPY, 'Copy', function () {
      if (navigator.clipboard) navigator.clipboard.writeText(text);
      if (opts.onCopy) try { opts.onCopy(text); } catch (e) {}
    }));
    row.appendChild(btn(ICON_THUMBS_UP, 'Helpful', function () {
      if (opts.onThumbUp) try { opts.onThumbUp(text); } catch (e) {}
    }));
    row.appendChild(btn(ICON_THUMBS_DOWN, 'Not helpful', function () {
      if (opts.onThumbDown) try { opts.onThumbDown(text); } catch (e) {}
    }));
    return row;
  }

  window.initChatMessages = function (opts) {
    opts = opts || {};
    var scope = opts.scope ? document.querySelector(opts.scope) : document;
    if (!scope) return;

    // Find every incoming bubble and append an actions row at the msg-group level
    // so it stacks below the bubble row (matches the v3 pattern), not next to the
    // bubble inside .msg-row (which would compete for width with avatar + bubble).
    var bubbles = scope.querySelectorAll('.msg-bubble-in');
    bubbles.forEach(function (bubble) {
      // Prefer the .msg-group ancestor; fall back to the bubble's direct parent.
      var host = bubble.closest ? bubble.closest('.msg-group') : null;
      if (!host) host = bubble.parentNode;
      if (!host) return;

      // Skip if this host already has an actions row
      if (host.querySelector(':scope > .msg-actions')) return;

      var text = (bubble.textContent || '').trim();
      var actions = makeActionsRow(text, opts);
      host.appendChild(actions);
    });
  };
})();
