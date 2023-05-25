import { SYNC_SCROLL_ELEMENT_CLASS_NAME, useActiveTab } from '@';
import { useDomScrollHeight } from '@/hooks/useDomScrollHeight';
import { debounce } from 'lodash';
import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

// It will be occluded by richText bar, so it needs to be offset
const offsetTop = 50;

export const SyncScrollShadowDom: React.FC<
  React.HTMLProps<HTMLElement> & { isActive: boolean }
> = props => {
  // ShadowRoot that will be created and host the content
  const [root, setRoot] = useState<null | ShadowRoot>(null);
  // The ref of the element that will be rendered in the shadowRoot
  const [ref, setRef] = useState<null | HTMLDivElement>(null);
  // A React content that will hold the scroll position
  // composed of the following props with corresponding default values:
  // scrollHeight : { current: 0 }
  // viewElementRef: { current: null }
  // When a scroll event is fired the first visible element will be set in viewElementRef
  const { viewElementRef } = useDomScrollHeight();
  // Tabs are: editor, desktop preview and mobile preview
  const { activeTab } = useActiveTab();
  // isActive is true when the tab is desktop preview
  const { isActive, ...rest } = props;

  const setFirstVisibleEle = useCallback(
    debounce((root: HTMLElement) => {
      if (!root.shadowRoot) return;

      const { left, width, top: containerTop } = root.getBoundingClientRect();

      const ele = root.shadowRoot.elementFromPoint(
        left + width / 2,
        containerTop + offsetTop,
      );

      const findSelectorNode = (ele: Element): Element | null => {
        if (ele.getAttribute('data-selector')) {
          return ele;
        }
        if (ele.parentNode instanceof Element) {
          return findSelectorNode(ele.parentNode);
        }
        return null;
      };

      const selectorNode = ele && findSelectorNode(ele);

      viewElementRef.current = null;
      if (selectorNode) {
        const { top: selectorEleTop } = selectorNode.getBoundingClientRect();

        let selectorDiffTop = selectorEleTop - containerTop;

        const selector = selectorNode.getAttribute('data-selector');

        if (selector) {
          viewElementRef.current = {
            selector: selector || '',
            top: selectorDiffTop,
          };
        }
      }
    }, 200),
    [viewElementRef],
  );

  useEffect(() => {
    if (!isActive || !root) return;
    const viewElement = viewElementRef.current;
    // The container(div) element with class preview-container
    // and easy-email-sync-scroll
    // This is the div where the shadowDOM is rendered
    const scrollEle = root.querySelector(`.${SYNC_SCROLL_ELEMENT_CLASS_NAME}`);
    if (!scrollEle) return;

    if (viewElement) {
      const viewElementNode = root.querySelector(
        `[data-selector="${viewElement?.selector}"]`,
      );

      if (viewElementNode && scrollEle) {
        viewElementNode.scrollIntoView();

        scrollEle.scrollTo(0, scrollEle.scrollTop - viewElement.top);
      }
    } else {
      scrollEle.scrollTo(0, 0);
    }
  }, [root, viewElementRef, activeTab, isActive]);

  useEffect(() => {
    if (ref) {
      const root = ref.attachShadow({ mode: 'open' });
      // The shadowDom root
      setRoot(root);
      if (!ref.shadowRoot) return;

      const onScroll = () => {
        if (!ref.shadowRoot) return;
        // Updates the scroll sync context with the new first element visible
        setFirstVisibleEle(ref);
      };
      ref.shadowRoot.addEventListener('scroll', onScroll, true);
      return () => {
        ref.shadowRoot?.removeEventListener('scroll', onScroll, true);
      };
    }
  }, [ref, setFirstVisibleEle]);

  return (
    <>
      <div
        {...(rest as any)}
        ref={setRef}
      >
        {root && ReactDOM.createPortal(props.children, root as any)}
      </div>
    </>
  );
};
