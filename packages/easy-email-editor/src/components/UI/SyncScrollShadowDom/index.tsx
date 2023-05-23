import { SYNC_SCROLL_ELEMENT_CLASS_NAME, useActiveTab } from '@';
import { useDomScrollHeight } from '@/hooks/useDomScrollHeight';
import { debounce } from 'lodash';
import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { IframeComponent } from '../IframeComponent';

// It will be occluded by richText bar, so it needs to be offset
const offsetTop = 50;

export const SyncScrollShadowDom: React.FC<
  React.HTMLProps<HTMLElement> & {
    isActive: boolean;
    iframewin: Window;
    iframedoc: Document;
  }
> = props => {
  const [root, setRoot] = useState<null | Document>(null);
  const [ref, setRef] = useState<null | HTMLDivElement>(null);
  const { viewElementRef } = useDomScrollHeight();
  const { activeTab } = useActiveTab();
  const { isActive, ...rest } = props;

  const setFirstVisibleEle = useCallback(
    debounce((root: HTMLElement) => {
      if (!props.iframedoc) return;

      // const left = window.screenLeft;
      // const containerTop = window.screenTop;
      // const width = window.outerWidth;
      // const { left, width, top: containerTop } = window.screen;
      const {
        left,
        width,
        top: containerTop,
      } = props.iframedoc.body.getBoundingClientRect();
      debugger;

      const ele = props.iframedoc.elementFromPoint(
        left + width / 2,
        containerTop + offsetTop,
      );
      console.log('ele', ele);

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
        console.log('selector', selector);

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
      // const root = ref.attachShadow({ mode: 'open' });
      setRoot(props.iframedoc);
      // if (!ref.shadowRoot) return;

      const onScroll = () => {
        if (!window) return;
        setFirstVisibleEle(ref);
      };

      window.addEventListener('scroll', onScroll, true);
      console.log('window', window);
      return () => {
        window?.removeEventListener('scroll', onScroll, true);
      };
    }
  }, [ref, setFirstVisibleEle]);

  return (
    <>
      <div
        {...(rest as any)}
        ref={setRef}
      >
        {props.children}
        {/* {root && ReactDOM.createPortal(props.children, root as any)} */}
      </div>
    </>
  );
};
