import { observer } from 'mobx-react-lite';
import { useRef, useState } from 'react';
import QRCode from 'qrcode';
import rootStore from '../../stores/RootStore';

const BackgroundPanel = observer(() => {
  const { layerManager } = rootStore.designManager;
  const colors = ['#ffffff', '#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
  const bgSvgs = ['/Background/15599729221367677852.svg', '/Background/15599729861913627339.svg'];

  return (
    <div className="p-5 flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Background</h2>

        <h3 className="text-sm font-medium text-gray-500 mb-2">Colors</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {colors.map(color => (
            <button 
              key={color}
              onClick={() => layerManager.setBackgroundColor(color)}
              className={`w-8 h-8 rounded-full border shadow-sm transition-transform ${layerManager.backgroundColor === color && !layerManager.backgroundImage ? 'border-blue-500 scale-110 ring-2 ring-blue-200' : 'border-gray-200 hover:scale-105'}`}
              style={{ backgroundColor: color }}
            />
          ))}
          <input 
            type="color" 
            value={layerManager.backgroundColor}
            onChange={(e) => layerManager.setBackgroundColor(e.target.value)}
            className="w-8 h-8 rounded-full cursor-pointer border-0 p-0 overflow-hidden shadow-sm"
          />
        </div>

        <h3 className="text-sm font-medium text-gray-500 mb-2 mt-4">Images</h3>
        <div className="grid grid-cols-2 gap-2">
          {bgSvgs.map(svg => (
            <div 
              key={svg}
              onClick={() => layerManager.setBackgroundImage(svg)}
              className={`border-2 rounded-md overflow-hidden cursor-pointer h-20 flex items-center justify-center bg-gray-50 transition-colors ${layerManager.backgroundImage === svg ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-300'}`}
            >
              <img src={svg} alt="background" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
});

const SizePanel = observer(() => {
  const { sizeManager } = rootStore.designManager;

  return (
    <div className="p-5 flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Banner Size</h2>
        <div className="grid grid-cols-2 gap-2">
          {sizeManager.presets.map((preset, index) => {
            const displayW = sizeManager.unit === 'Inches' ? preset.width * 12 : preset.width;
            const displayH = sizeManager.unit === 'Inches' ? preset.height * 12 : preset.height;
            const isActive = sizeManager.width === displayW && sizeManager.height === displayH;

            return (
              <button
                key={index}
                onClick={() => {
                  sizeManager.setDimensions(displayW, displayH);
                }}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors border ${
                  isActive
                    ? 'bg-white text-orange-500 border-orange-500'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {`${displayW} x ${displayH}`}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-5 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Custom Size</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1 font-semibold">Width ({sizeManager.unit})</label>
            <input
              type="number"
              value={sizeManager.width}
              onChange={(e) => sizeManager.setDimensions(Number(e.target.value), sizeManager.height)}
              className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1 font-semibold">Height ({sizeManager.unit})</label>
            <input
              type="number"
              value={sizeManager.height}
              onChange={(e) => sizeManager.setDimensions(sizeManager.width, Number(e.target.value))}
              className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

const GraphicsPanel = observer(() => {
  const { layerManager } = rootStore.designManager;
  const graphicsSvgs = ['/Graphics/201206291244061340948646892425803.svg', '/Graphics/2012071807462913426155891467358529.svg'];

  return (
    <div className="p-5 flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Graphics</h2>
        <p className="text-xs text-gray-500 mb-4">Click a graphic to add it to your banner.</p>
        
        <div className="grid grid-cols-2 gap-3">
          {graphicsSvgs.map(svg => (
            <button 
              key={svg}
              onClick={() => layerManager.addGraphic(svg)}
              className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer h-24 flex items-center justify-center bg-gray-50 hover:bg-white hover:border-blue-400 hover:shadow-md transition-all p-2 group"
            >
              <img src={svg} alt="graphic" className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

const TextPanel = observer(() => {
  const { layerManager, uiManager } = rootStore.designManager;
  const activeSide = uiManager.activeSide || 'front';
  const textLayers = layerManager.layers.filter(l => l.type === 'text' && (l.side === activeSide || !l.side));

  return (
    <div className="p-5 flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Text</h2>
        <p className="text-sm text-gray-600 mb-6">Edit your text below, or click on the field you'd like to edit directly on your design.</p>
        
        <div className="flex flex-col gap-4">
          {textLayers.map(layer => (
            <textarea
              key={layer.id}
              value={layer.text}
              onChange={(e) => layerManager.updateLayer(layer.id, { text: e.target.value })}
              onFocus={() => uiManager.setSelectedObject({ type: 'text', id: layer.id })}
              placeholder="Enter text..."
              className={`w-full h-24 bg-white border rounded-md p-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm resize-none ${
                uiManager.selectedObject?.id === layer.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'
              }`}
            />
          ))}
          
          <button
            onClick={() => layerManager.addText("Sample Text")}
            className="self-end rounded-md bg-[#ff7848] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#f36737] focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors"
          >
            + Add New Text Field
          </button>
        </div>
      </div>
    </div>
  );
});

const acceptedImageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/svg+xml',
  'image/webp',
  'image/bmp',
]);

const acceptedImageExtensions = /\.(jpe?g|png|gif|svg|webp|bmp)$/i;

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error(`Could not read "${file.name}" as an image.`));
      }
    };
    reader.onerror = () => reject(reader.error || new Error(`Could not read "${file.name}".`));
    reader.readAsDataURL(file);
  });
}

const UploadsPanel = observer(() => {
  const { layerManager } = rootStore.designManager;
  const fileInputRef = useRef(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [error, setError] = useState('');

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    const invalidFile = files.find(file =>
      !acceptedImageTypes.has(file.type) && !acceptedImageExtensions.test(file.name)
    );
    if (invalidFile) {
      setError(`"${invalidFile.name}" is not a supported image. Choose JPG, PNG, GIF, SVG, WEBP, or BMP.`);
      return;
    }

    setError('');
    try {
      const uploads = await Promise.all(files.map(async (file) => ({
        name: file.name,
        url: await readImageFile(file),
      })));
      uploads.forEach(({ name, url }) => layerManager.addUpload(name, url));
    } catch (readError) {
      setError(readError.message || 'The selected image could not be read.');
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDraggingOver(false);
    uploadFiles(event.dataTransfer.files);
  };

  return (
    <div className="p-5">
      <h2 className="text-2xl font-semibold text-gray-900 mb-5">Upload</h2>
      <p className="text-sm text-gray-700 mb-1">Accepted formats</p>
      <p className="text-sm text-gray-600 leading-6 mb-5">.jpg, .jpeg, .png, .gif, .svg, .webp, .bmp</p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.gif,.svg,.webp,.bmp,image/jpeg,image/png,image/gif,image/svg+xml,image/webp,image/bmp"
        multiple
        className="hidden"
        onChange={(event) => {
          uploadFiles(event.target.files);
          event.target.value = '';
        }}
      />

      <div
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setIsDraggingOver(false);
        }}
        onDrop={handleDrop}
        className={`rounded-lg border-2 border-dashed p-5 text-center transition-colors ${
          isDraggingOver ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-white'
        }`}
      >
        <svg className="w-8 h-8 mx-auto mb-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 18a4.6 4.6 0 01-.8-9.1A5.5 5.5 0 0116.8 7a4 4 0 011.2 7.8M12 12v9m0-9l-3 3m3-3l3 3" />
        </svg>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-md bg-[#ff7848] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#f36737] focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          Upload Your Own Image
        </button>
        <p className="mt-2 text-sm text-gray-600">or drop your file here</p>
      </div>

      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-6 border-t border-gray-200 pt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Recently Uploaded</h3>
        {layerManager.uploads.length === 0 ? (
          <p className="text-sm text-gray-500">Your uploaded images will appear here.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {layerManager.uploads.map((upload) => (
              <button
                key={upload.id}
                type="button"
                onClick={() => layerManager.addGraphic(upload.url)}
                title={`Add ${upload.name} to the banner`}
                aria-label={`Add ${upload.name} to the banner`}
                className="aspect-square overflow-hidden border border-gray-200 bg-white p-1 hover:border-blue-500 hover:ring-2 hover:ring-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <img src={upload.url} alt={upload.name} className="h-full w-full object-contain" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

const QrCodePanel = observer(() => {
  const { layerManager } = rootStore.designManager;
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const addQrCode = async (event) => {
    event.preventDefault();
    const value = url.trim();
    let parsedUrl;

    try {
      parsedUrl = new URL(value);
    } catch {
      setError('Enter a valid URL, including https:// or http://.');
      return;
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      setError('Enter a URL that starts with https:// or http://.');
      return;
    }

    setError('');
    setIsGenerating(true);
    try {
      const qrImage = await QRCode.toDataURL(value, {
        errorCorrectionLevel: 'H',
        margin: 4,
        width: 512,
        type: 'image/png',
      });
      layerManager.addGraphic(qrImage);
    } catch (generationError) {
      console.error('[QrCodePanel] QR code generation failed:', generationError);
      setError('The QR code could not be generated. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-5">
      <h2 className="text-2xl font-semibold text-gray-900 mb-3">QR Code</h2>
      <p className="text-sm text-gray-700 mb-6">Enter a valid URL and click the ‘add’ button.</p>
      <form onSubmit={addQrCode}>
        <label htmlFor="qr-code-url" className="sr-only">URL for QR code</label>
        <input
          id="qr-code-url"
          type="url"
          required
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            if (error) setError('');
          }}
          placeholder="https://www.example.com/"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={!url.trim() || isGenerating}
            className="rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isGenerating ? 'Generating…' : '+ Add QR Code'}
          </button>
        </div>
      </form>
    </div>
  );
});

function Sidebar() {
  const { toolManager } = rootStore.designManager;

  const tools = [
    { id: 'size', label: 'Size', icon: 'M4 6h16M4 12h16M4 18h16M8 4v4m8 4v4m-8 4v4' },
    { id: 'text', label: 'Text', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'background', label: 'Background', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'graphics', label: 'Graphics', icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'uploads', label: 'Uploads', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
    { id: 'qrcode', label: 'QR Code', icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z' }
  ];

  return (
    <div className="flex h-full bg-white border-r border-gray-200 z-10 shadow-sm relative">
      <aside className="w-20 bg-white border-r border-gray-100 flex flex-col items-center py-4 gap-3 z-20">
        {tools.map(tool => (
          <button 
            key={tool.id}
            onClick={() => toolManager.setActiveTool(tool.id)}
            aria-pressed={toolManager.activeTool === tool.id}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl w-16 transition-colors ${toolManager.activeTool === tool.id ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={tool.icon} />
            </svg>
            <span className="text-[10px] font-medium text-center leading-tight">{tool.label}</span>
          </button>
        ))}
      </aside>

      <aside className="w-72 bg-[#fcfcfc] overflow-y-auto">
        {toolManager.activeTool === 'size' && <SizePanel />}
        {toolManager.activeTool === 'text' && <TextPanel />}
        {toolManager.activeTool === 'background' && <BackgroundPanel />}
        {toolManager.activeTool === 'graphics' && <GraphicsPanel />}
        {toolManager.activeTool === 'uploads' && <UploadsPanel />}
        {toolManager.activeTool === 'qrcode' && <QrCodePanel />}
      </aside>
    </div>
  );
}

export default observer(Sidebar);
