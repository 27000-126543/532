import { create } from 'zustand';
import type { ViewMode, CameraPosition } from '@/types';

interface SceneState {
  viewMode: ViewMode;
  selectedBuildingId: string | null;
  selectedHouseId: string | null;
  cameraPosition: CameraPosition;
  showPanel: boolean;
  setViewMode: (mode: ViewMode) => void;
  selectBuilding: (buildingId: string | null) => void;
  selectHouse: (houseId: string | null) => void;
  togglePanel: () => void;
  setCameraPosition: (position: CameraPosition) => void;
  resetScene: () => void;
}

const initialCameraPosition: CameraPosition = { x: 0, y: 30, z: 50 };

const useSceneStore = create<SceneState>((set) => ({
  viewMode: 'community',
  selectedBuildingId: null,
  selectedHouseId: null,
  cameraPosition: initialCameraPosition,
  showPanel: false,

  setViewMode: (mode) => set({ viewMode: mode }),

  selectBuilding: (buildingId) =>
    set({
      selectedBuildingId: buildingId,
      selectedHouseId: null,
      viewMode: buildingId ? 'building' : 'community'
    }),

  selectHouse: (houseId) =>
    set({
      selectedHouseId: houseId,
      viewMode: houseId ? 'house' : 'building'
    }),

  togglePanel: () => set((state) => ({ showPanel: !state.showPanel })),

  setCameraPosition: (position) => set({ cameraPosition: position }),

  resetScene: () =>
    set({
      viewMode: 'community',
      selectedBuildingId: null,
      selectedHouseId: null,
      cameraPosition: initialCameraPosition,
      showPanel: false
    })
}));

export default useSceneStore;
