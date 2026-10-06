import { observer } from 'mobx-react-lite';
import rootStore from './stores/RootStore';
import Sidebar from './components/layout/Sidebar';
import Viewport3D from './canvas3d/Viewport3D';

const SelectionToolbar = observer(() => {
  const { uiManager } = rootStore.designManager;

  const selectionActions = [
    { label: 'Cut', icon: 'M6 6l12 12M18 6L6 18M6 6a2 2 0 1 0 0 .01M18 18a2 2 0 1 0 0 .01', action: () => uiManager.cutSelected() },
    { label: 'Copy', icon: 'M8 8h11v13H8zM5 16H4V3h11v2', action: () => uiManager.copySelected() },
    { label: 'Delete', icon: 'M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3', action: () => uiManager.deleteSelected() },
    { label: 'Bring Forward', icon: 'M5 15l7-7 7 7', action: () => uiManager.positionSelected('forward') },
    { label: 'Send Backward', icon: 'M19 9l-7 7-7-7', action: () => uiManager.positionSelected('backward') },
    { label: 'Opacity', icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 0v18m0-9h9', action: () => uiManager.opacitySelected() },
    { label: 'Rotate', icon: 'M20 11a8 8 0 0 0-14-5L4 8m0-5v5h5m-5 5a8 8 0 0 0 14 5l2-2m0 5v-5h-5', action: () => uiManager.rotateSelected() },
    { label: 'Flip H', icon: 'M12 3v18M4 8l4 4-4 4m16-8-4 4 4 4', action: () => uiManager.flipHSelected() },
    { label: 'Flip V', icon: 'M3 12h18M8 4l4 4 4-4m-8 16 4-4 4 4', action: () => uiManager.flipVSelected() },
  ];

  return (
    <div
      role="toolbar"
      aria-label="Selected object actions"
      className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-1.5 z-30 max-w-[calc(100%-2rem)] overflow-x-auto gap-1"
    >
      {selectionActions.map((action, index) => (
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
      ))}
    </div>
  );
});

function App() {
  const { sizeManager, uiManager } = rootStore.designManager;
  const showSelectionToolbar = uiManager.selectedObject && uiManager.selectedObject.type !== 'background';

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

