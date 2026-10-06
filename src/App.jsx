import { observer } from 'mobx-react-lite';
import rootStore from './stores/RootStore';
import Sidebar from './components/layout/Sidebar';
import Viewport3D from './canvas3d/Viewport3D';

function App() {
  const { sizeManager, uiManager } = rootStore.designManager;

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
          <Viewport3D />
          
          {/* Toggle Front/Back Overlay */}
          <div className="absolute bottom-8 w-full flex justify-center pointer-events-none">
            <div className="bg-white p-1 rounded-lg shadow-md border border-gray-200 flex pointer-events-auto">
              <button 
                onClick={() => uiManager.setActiveSide('front')}
                className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${uiManager.activeSide === 'front' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                Front
              </button>
              <button 
                onClick={() => uiManager.setActiveSide('back')}
                className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${uiManager.activeSide === 'back' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                Back
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default observer(App);
