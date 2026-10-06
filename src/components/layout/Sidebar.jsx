import { observer } from 'mobx-react-lite';
import rootStore from '../../stores/RootStore';

function Sidebar() {
  const { sizeManager, layerManager } = rootStore.designManager;

  return (
    <aside className="w-72 bg-white border-r border-gray-200 p-5 overflow-y-auto flex flex-col gap-6 shadow-sm z-10">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Banner Size</h2>
        
        <div className="flex flex-col gap-2">
          {sizeManager.presets.map((preset, index) => (
            <button
              key={index}
              onClick={() => {
                sizeManager.setDimensions(preset.width, preset.height);
                sizeManager.setUnit(preset.unit);
              }}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors border ${
                sizeManager.width === preset.width && sizeManager.height === preset.height && sizeManager.unit === preset.unit
                  ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {preset.label}
            </button>
          ))}
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

      <div className="pt-5 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Add Text</h3>
        <textarea
          value={layerManager.bannerText}
          onChange={(e) => layerManager.setBannerText(e.target.value)}
          placeholder="Enter banner text..."
          className="w-full h-32 bg-white border border-gray-300 rounded-md p-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm resize-none"
        />
      </div>
    </aside>
  );
}

export default observer(Sidebar);
