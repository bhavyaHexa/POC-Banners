import { observer } from 'mobx-react-lite';
import { jsPDF } from 'jspdf';
import { useCallback, useEffect, useRef, useState } from 'react';
import rootStore from './stores/RootStore';
import Sidebar from './components/layout/Sidebar';
import Viewport3D from './canvas3d/Viewport3D';

const SelectionToolbar = observer(() => {
  const { uiManager, layerManager } = rootStore.designManager;
  const [isOpacityOpen, setIsOpacityOpen] = useState(false);

  let currentOpacity = 1;
  if (uiManager.selectedObject) {
    if (uiManager.selectedObject.type === 'graphic') {
      const layer = layerManager.layers.find(l => l.id === uiManager.selectedObject.id);
      if (layer && layer.opacity !== undefined) currentOpacity = layer.opacity;
    } else if (uiManager.selectedObject.type === 'text') {
      const props = uiManager.activeSide === 'back' ? layerManager.textPropsBack : layerManager.textPropsFront;
      if (props.opacity !== undefined) currentOpacity = props.opacity;
    }
  }

  const handleOpacityChange = (e) => {
    const val = Number(e.target.value) / 100;
    if (uiManager.selectedObject.type === 'graphic') {
      layerManager.updateLayer(uiManager.selectedObject.id, { opacity: val });
    } else if (uiManager.selectedObject.type === 'text') {
      layerManager.updateTextProps({ opacity: val });
    }
  };

  const selectionActions = [
    { label: 'Cut', icon: 'M6 6l12 12M18 6L6 18M6 6a2 2 0 1 0 0 .01M18 18a2 2 0 1 0 0 .01', action: () => uiManager.cutSelected() },
    { label: 'Copy', icon: 'M8 8h11v13H8zM5 16H4V3h11v2', action: () => uiManager.copySelected() },
    { label: 'Delete', icon: 'M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3', action: () => uiManager.deleteSelected() },
    { label: 'Bring Forward', icon: 'M5 15l7-7 7 7', action: () => uiManager.positionSelected('forward') },
    { label: 'Send Backward', icon: 'M19 9l-7 7-7-7', action: () => uiManager.positionSelected('backward') },
    { type: 'opacity', label: 'Opacity', icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 0v18m0-9h9', action: () => setIsOpacityOpen(!isOpacityOpen) },
    { label: 'Rotate', icon: 'M20 11a8 8 0 0 0-14-5L4 8m0-5v5h5m-5 5a8 8 0 0 0 14 5l2-2m0 5v-5h-5', action: () => uiManager.rotateSelected() },
    { label: 'Flip H', icon: 'M12 3v18M4 8l4 4-4 4m16-8-4 4 4 4', action: () => uiManager.flipHSelected() },
    { label: 'Flip V', icon: 'M3 12h18M8 4l4 4 4-4m-8 16 4-4 4 4', action: () => uiManager.flipVSelected() },
  ];

  return (
    <div
      role="toolbar"
      aria-label="Selected object actions"
      className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-1.5 z-30 w-max max-w-[calc(100%-2rem)] gap-1"
    >
      {selectionActions.map((action, index) => {
        if (action.type === 'opacity') {
          return (
            <div key="opacity" className="flex items-center relative">
              {index > 0 && <span className="h-5 border-l border-gray-200 mx-1" />}
              <button
                onClick={action.action}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                  isOpacityOpen ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
                title={action.label}
              >
                <svg className={`w-4 h-4 ${isOpacityOpen ? 'text-blue-600' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                </svg>
                <span>{action.label}</span>
              </button>
              
              {isOpacityOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white border border-gray-200 rounded-xl shadow-xl p-4 z-40 flex flex-col gap-3 min-w-[220px]">
                  <span className="text-sm font-medium text-gray-600">Transparency</span>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={Math.round(currentOpacity * 100)} 
                      onChange={handleOpacityChange}
                      className="flex-1 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-gray-800"
                    />
                    <div className="border border-gray-300 rounded px-2 py-1 text-xs text-gray-800 w-12 text-center bg-white shadow-sm">
                      {currentOpacity.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }

        return (
          <div key={action.label} className="flex items-center">
            {index > 0 && <span className="h-5 border-l border-gray-200 mx-1" />}
            <button
              onClick={action.action}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors whitespace-nowrap cursor-pointer"
              title={action.label}
            >
              <svg className="w-4 h-4 text-gray-600 hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
              </svg>
              <span>{action.label}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
});

function App() {
  const { sizeManager, uiManager } = rootStore.designManager;
  const showSelectionToolbar = uiManager.selectedObject && uiManager.selectedObject.type !== 'background';
  const captureScreenshotsRef = useRef(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [shareError, setShareError] = useState('');
  const [previews, setPreviews] = useState(null);

  const registerScreenshotCapture = useCallback((capture) => {
    captureScreenshotsRef.current = capture;
  }, []);

  const captureSharePreviews = useCallback(async () => {
    if (!captureScreenshotsRef.current) {
      setShareError('The banner preview is still loading. Please try again.');
      return;
    }

    setIsCapturing(true);
    setShareError('');
    try {
      setPreviews(await captureScreenshotsRef.current());
    } catch (error) {
      console.error('[Share] Could not capture banner sides:', error);
      setShareError(error.message || 'Could not capture the banner previews.');
    } finally {
      setIsCapturing(false);
    }
  }, []);

  const openShareDialog = () => {
    setIsShareOpen(true);
    captureSharePreviews();
  };

  useEffect(() => {
    if (!isShareOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsShareOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isShareOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if typing in an input field (like the text box or custom sizes)
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        uiManager.copySelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
        uiManager.cutSelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        uiManager.pasteClipboard();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        uiManager.deleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [uiManager]);

  return (
    <div className="flex flex-col h-screen bg-[#f8f9fa] text-gray-900 overflow-hidden font-sans">
      <header className="h-16 bg-white flex items-center justify-between px-8 border-b border-gray-200 shadow-sm z-10">
        <h1 className="text-xl font-bold tracking-tight text-gray-800 flex items-center gap-2">
          3D Banner Designer
        </h1>
        <div className="text-sm font-medium text-gray-600 bg-gray-100 px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
          Current Size: {sizeManager.width} x {sizeManager.height} {sizeManager.unit}
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 relative shadow-inner bg-[#f8f9fa]">
          {showSelectionToolbar && <SelectionToolbar />}
          <Viewport3D onCaptureReady={registerScreenshotCapture} />
        </main>
      </div>

      <footer className="h-16 shrink-0 border-t border-gray-200 bg-white px-5 flex items-center justify-between shadow-sm">
        <button
          type="button"
          onClick={openShareDialog}
          className="flex items-center gap-2 rounded-md bg-[#ff7848] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#f36737] focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5-5m0 0l5 5m-5-5v12m-7 3h14" />
          </svg>
          Share
        </button>

        <div className="bg-gray-100 p-1 rounded-lg border border-gray-200 flex">
          {['front', 'back'].map((side) => (
            <button
              key={side}
              type="button"
              onClick={() => uiManager.setActiveSide(side)}
              aria-pressed={uiManager.activeSide === side}
              className={`px-6 py-2 rounded-md text-sm font-semibold capitalize transition-all ${
                uiManager.activeSide === side
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {side}
            </button>
          ))}
        </div>

        <div className="text-sm font-medium text-gray-600">
          {sizeManager.width} x {sizeManager.height} {sizeManager.unit}
        </div>
      </footer>

      {isShareOpen && (
        <ShareDialog
          onClose={() => setIsShareOpen(false)}
          onRetryCapture={captureSharePreviews}
          isCapturing={isCapturing}
          error={shareError}
          previews={previews}
          bannerWidth={sizeManager.unit === 'Feet' ? sizeManager.width : sizeManager.width / 12}
          bannerHeight={sizeManager.unit === 'Feet' ? sizeManager.height : sizeManager.height / 12}
        />
      )}
    </div>
  );
}

function ShareDialog({ onClose, onRetryCapture, isCapturing, error, previews, bannerWidth, bannerHeight }) {
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [sendMessage, setSendMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const sendArtwork = async (event) => {
    event.preventDefault();
    if (!previews || isSending) return;

    setIsSending(true);
    setSendMessage('');
    try {
      const pdf = new jsPDF({
        orientation: bannerWidth >= bannerHeight ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      pdf.setProperties({
        title: 'Banner artwork',
        subject: `Artwork prepared for ${recipientName} (${recipientEmail})`,
        author: recipientName,
        keywords: notes,
      });

      const addSidePage = (image, side) => {
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 12;
        const labelHeight = 10;
        const maxWidth = pageWidth - margin * 2;
        const maxHeight = pageHeight - margin * 2 - labelHeight;
        const aspect = bannerWidth / bannerHeight;
        const imageWidth = Math.min(maxWidth, maxHeight * aspect);
        const imageHeight = imageWidth / aspect;
        const x = (pageWidth - imageWidth) / 2;
        const y = margin + labelHeight + (maxHeight - imageHeight) / 2;

        pdf.setFontSize(12);
        pdf.text(side, pageWidth / 2, margin + 4, { align: 'center' });
        pdf.addImage(image, 'PNG', x, y, imageWidth, imageHeight);
      };

      addSidePage(previews.front, 'Front');
      pdf.addPage();
      addSidePage(previews.back, 'Back');

      const pdfDataUrl = pdf.output('datauristring');
      const response = await fetch('/api/share-artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName,
          recipientEmail,
          notes,
          pdfBase64: pdfDataUrl.slice(pdfDataUrl.indexOf(',') + 1),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'The artwork email could not be sent.');
      }

      setSendMessage(`Artwork sent successfully to ${recipientEmail}.`);
    } catch (sendError) {
      console.error('[Share] Could not send artwork email:', sendError);
      setSendMessage(sendError.message || 'The artwork email could not be sent. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-dialog-title"
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 id="share-dialog-title" className="text-2xl font-semibold text-gray-800">Share Your Creation</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {['front', 'back'].map((side) => (
              <div key={side} className="min-w-0">
                <h3 className="mb-2 text-sm font-semibold capitalize text-gray-700">{side} page</h3>
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden border border-gray-200 bg-gray-50">
                  {previews ? (
                    <img src={previews[side]} alt={`${side} banner preview`} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-sm text-gray-500">
                      {isCapturing ? 'Preparing screenshot…' : 'Preview unavailable'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
              <p role="alert">{error}</p>
              {!isCapturing && (
                <button type="button" onClick={onRetryCapture} className="shrink-0 font-semibold underline">
                  Retry
                </button>
              )}
            </div>
          )}

          <form onSubmit={sendArtwork} className="mt-6 space-y-3">
            <label className="sr-only" htmlFor="share-recipient-name">Recipient’s name</label>
            <input
              id="share-recipient-name"
              required
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
              placeholder="Recipient's Name*"
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <label className="sr-only" htmlFor="share-recipient-email">Recipient’s email address</label>
            <input
              id="share-recipient-email"
              required
              type="email"
              value={recipientEmail}
              onChange={(event) => setRecipientEmail(event.target.value)}
              placeholder="Recipient's Email Address*"
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <label className="sr-only" htmlFor="share-notes">Notes (optional)</label>
            <input
              id="share-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Notes (optional)"
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            {sendMessage && (
              <p role={sendMessage.startsWith('Artwork sent successfully') ? 'status' : 'alert'}
                className={`text-sm ${sendMessage.startsWith('Artwork sent successfully') ? 'text-green-700' : 'text-red-600'}`}>
                {sendMessage}
              </p>
            )}

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
              <button
                type="submit"
                disabled={!previews || isCapturing || isSending}
                className="rounded-md bg-[#ff7848] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#f36737] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isSending ? 'Sending…' : 'Send Artwork'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-[#ff7848] px-5 py-2.5 text-sm font-semibold text-[#f36737] hover:bg-orange-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default observer(App);
