/**
 * Composer "expand input" toggle.
 *
 * Adds a compact button beside the composer submit action. Clicking it makes
 * the input box visibly taller (it raises the draft's max-height cap AND sets
 * a minimum height so an empty box also grows) and switches the composer into
 * "multiline" mode: plain Enter inserts a new line instead of sending, so you
 * send by clicking the Send button (or Ctrl/Cmd+Enter). Clicking again
 * restores the normal box and the normal Enter-to-send.
 *
 * Enter -> newline is implemented by intercepting the keydown in the capture
 * phase before the host keymap, then re-dispatching it as Shift+Enter so the
 * host's own soft-line-break path runs. Shift+Enter, Ctrl/Cmd+Enter, and IME
 * composition are left untouched.
 */
window.__ModuleLoader__.load({
  id: 'dsh-composer-expand',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useState, useRef, useEffect, useLayoutEffect } = React;

    const NS = 'composer-expand';
    // Default cap is 336px and the box is content-sized (~36px when empty).
    // Expanded: a visible floor (so an empty box grows) plus a larger cap.
    const EXPANDED_MIN_HEIGHT = '320px';
    const EXPANDED_MAX_HEIGHT = '560px';

    const STYLE_TEXT = [
      '[data-composer-card][data-composer-expanded]{--dsh-composer-text-max-height:' + EXPANDED_MAX_HEIGHT + '}',
      '[data-composer-card][data-composer-expanded] [data-input-scroll]{min-height:' + EXPANDED_MIN_HEIGHT + '}',
      '[data-composer-card][data-composer-expanded] [data-composer-input]{min-height:' + EXPANDED_MIN_HEIGHT + '}',
    ].join('\n');

    function ExpandIcon() {
      return h('svg', {
        viewBox: '0 0 14 14', width: 14, height: 14, fill: 'none', 'aria-hidden': true,
      },
        h('path', { d: 'M5 1H2a1 1 0 0 0-1 1v3', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }),
        h('path', { d: 'M9 1h3a1 1 0 0 1 1 1v3', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }),
        h('path', { d: 'M5 13H2a1 1 0 0 1-1-1v-3', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }),
        h('path', { d: 'M9 13h3a1 1 0 0 0 1-1v-3', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      );
    }

    function CollapseIcon() {
      return h('svg', {
        viewBox: '0 0 14 14', width: 14, height: 14, fill: 'none', 'aria-hidden': true,
      },
        h('path', { d: 'M2 5V2h3', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }),
        h('path', { d: 'M12 5V2h-3', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }),
        h('path', { d: 'M2 9v3h3', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }),
        h('path', { d: 'M12 9v3h-3', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      );
    }

    function ComposerExpandToggle(props) {
      const t = props.t;
      const sessionId = props.sessionId;

      const [expanded, setExpanded] = useState(false);
      const [hover, setHover] = useState(false);
      const expandedRef = useRef(false);
      expandedRef.current = expanded;
      const rootRef = useRef(null);

      // One toggle per Session; a Session switch starts collapsed again.
      useEffect(() => { setExpanded(false); }, [sessionId]);

      // Mark the composer card so the injected rules raise its box.
      useLayoutEffect(() => {
        const card = rootRef.current === null ? null : rootRef.current.closest('[data-composer-card]');
        if (card === null) return;
        card.toggleAttribute('data-composer-expanded', expanded);
        return () => { card.removeAttribute('data-composer-expanded'); };
      }, [expanded]);

      // While expanded, turn plain Enter into a soft line break (Shift+Enter).
      useEffect(() => {
        const onKeyDown = (event) => {
          if (!expandedRef.current) return;
          if (event.key !== 'Enter') return;
          if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return;
          if (event.isComposing || event.keyCode === 229) return;
          const target = event.target;
          if (!(target instanceof Element)) return;
          if (target.closest('[data-composer-card]') === null) return;
          event.preventDefault();
          event.stopPropagation();
          const synthetic = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            shiftKey: true,
            bubbles: true,
            cancelable: true,
            composed: true,
            repeat: event.repeat,
          });
          target.dispatchEvent(synthetic);
        };
        document.addEventListener('keydown', onKeyDown, true);
        return () => { document.removeEventListener('keydown', onKeyDown, true); };
      }, []);

      const label = t(expanded ? 'collapse' : 'expand');
      const background = hover || expanded
        ? 'var(--dsw-alias-interactive-bg-hover)'
        : 'transparent';
      const color = expanded
        ? 'var(--dsw-alias-label-primary)'
        : 'var(--dsw-alias-label-secondary)';

      return h(React.Fragment, null,
        h('style', { key: 'composer-expand-styles' }, STYLE_TEXT),
        h('button', {
          key: 'composer-expand-button',
          ref: rootRef,
          type: 'button',
          'aria-label': label,
          'aria-pressed': expanded,
          title: label,
          onMouseEnter: () => setHover(true),
          onMouseLeave: () => setHover(false),
          onMouseDown: (event) => { event.preventDefault(); },
          onClick: () => setExpanded((value) => !value),
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: 'var(--dsw-radius-sm)',
            border: 'none',
            background,
            color,
            cursor: 'pointer',
            padding: 0,
            flex: 'none',
          },
        }, expanded ? h(CollapseIcon) : h(ExpandIcon)),
      );
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => {
          const disposeEn = ctx.locale.register(NS, 'en', {
            expand: 'Enlarge input',
            collapse: 'Restore input',
          });
          const disposeZh = ctx.locale.register(NS, 'zh', {
            expand: '放大输入框',
            collapse: '收起输入框',
          });
          return () => { disposeEn(); disposeZh(); };
        }, 'composer-expand: dictionaries');

        ctx.slots.inject('conversation.input.right', () => ctx.slots.register({
          name: 'conversation.input.right',
          id: 'composer-expand',
          order: 100,
          locale: NS,
        }, ComposerExpandToggle));
      },
    };
  },
});
