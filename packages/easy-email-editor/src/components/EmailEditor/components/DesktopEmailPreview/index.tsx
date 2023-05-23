import React, { useMemo, useState, useEffect } from 'react';
// import ReactDOM from 'react-dom';
import { useActiveTab } from '@/hooks/useActiveTab';
import { ActiveTabKeys } from '@/components/Provider/BlocksProvider';
import { usePreviewEmail } from '@/hooks/usePreviewEmail';
import { useEditorContext } from '@/hooks/useEditorContext';
import { SyncScrollShadowDom } from '@/components/UI/SyncScrollShadowDom';
import { classnames } from '@/utils/classnames';
import { SYNC_SCROLL_ELEMENT_CLASS_NAME } from '@/constants';
import { createPortal } from 'react-dom';
import Frame, { useFrame } from 'react-frame-component';

export function DesktopEmailPreview() {
  const { activeTab } = useActiveTab();
  const { errMsg, html, reactNode } = usePreviewEmail();
  const { document: iframeDoc, window: iframeWindow } = useFrame();

  // const [iframeRootNode, setIframeRootNode] = useState<null | HTMLElement>(null);

  // const EmailPreview = () => {
  //   return (
  //     <Frame initialContent={html}>
  //       <p>Hello from iframe</p>
  //     </Frame>
  //   );
  // };

  // useEffect(() => {
  //   const iframeRootNode = document.getElementById('desktop-email-preview-root');
  //   console.log('iframeRootNode', iframeRootNode);
  //   if (!iframeRootNode) return;
  //   setIframeRootNode(iframeRootNode);
  // }, [iframeRootNode]);

  // debugger;
  const { pageData } = useEditorContext();

  const fonts = useMemo(() => {
    return pageData.data.value.fonts || [];
  }, [pageData.data.value.fonts]);

  const isActive = activeTab === ActiveTabKeys.PC;

  if (errMsg) {
    return (
      <div style={{ textAlign: 'center', fontSize: 24, color: 'red' }}>
        <>{errMsg}</>
      </div>
    );
  }

  // console.log('iframeWindow', iframeWindow);
  // console.log('iframeDoc', iframeDoc.element);

  return (
    <div
      style={{
        height: '100%',
      }}
    >
      <div id='desktop-email-preview-root' />
      <SyncScrollShadowDom
        isActive={isActive}
        iframewin={iframeWindow!}
        iframedoc={iframeDoc!}
        style={{
          border: 'none',
          height: '100%',
          width: '100%',
        }}
      >
        <>
          <style>
            {`
                .preview-container {
                  overflow: overlay !important;
                }
                *::-webkit-scrollbar {
                  -webkit-appearance: none;
                  width: 0px;
                }
                *::-webkit-scrollbar-thumb {
                  background-color: rgba(0, 0, 0, 0.5);
                  box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
                  -webkit-box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
                }
              `}
          </style>
          <div
            className={classnames('preview-container', SYNC_SCROLL_ELEMENT_CLASS_NAME)}
            style={{
              height: '100%',
              overflow: 'auto',
              margin: 'auto',

              // paddingLeft: 10,
              // paddingRight: 10,
              paddingTop: 40,
              // paddingBottom: 140,
              boxSizing: 'border-box',
            }}
          >
            {/* <>{reactNode}</> */}
            <Frame
              // initialContent={}
              style={{
                border: 'none',
                height: '100%',
                width: '100%',
              }}
            >
              {reactNode}
            </Frame>
          </div>
          {createPortal(
            <>
              {fonts.map((item, index) => (
                <link
                  key={index}
                  href={item.href}
                  rel='stylesheet'
                  type='text/css'
                />
              ))}
            </>,
            document.body,
          )}
        </>
      </SyncScrollShadowDom>
    </div>
  );
}
