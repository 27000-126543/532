import { create } from 'zustand';
import type { Approval, ApprovalStage, ApprovalStatus } from '@/types';
import approvalsData from '@/data/approvals';

interface ApprovalState {
  approvals: Approval[];
  getApprovalsByStage: (stage: ApprovalStage) => Approval[];
  getApprovalsByStatus: (status: ApprovalStatus) => Approval[];
  getApprovalsByTenantId: (tenantId: string) => Approval[];
  getApprovalById: (id: string) => Approval | undefined;
  approveAtStage: (approvalId: string, stage: ApprovalStage, approver: string, opinion: string) => boolean;
  rejectAtStage: (approvalId: string, stage: ApprovalStage, approver: string, opinion: string) => boolean;
  getPendingCount: () => number;
  getCompletedCount: () => number;
  getRejectedCount: () => number;
}

const useApprovalStore = create<ApprovalState>((set, get) => ({
  approvals: approvalsData,

  getApprovalsByStage: (stage) =>
    get().approvals.filter((a) => a.currentStage === stage),

  getApprovalsByStatus: (status) =>
    get().approvals.filter((a) => a.status === status),

  getApprovalsByTenantId: (tenantId) =>
    get().approvals.filter((a) => a.tenantId === tenantId),

  getApprovalById: (id) => get().approvals.find((a) => a.id === id),

  approveAtStage: (approvalId, stage, approver, opinion) => {
    const approval = get().getApprovalById(approvalId);
    if (!approval || approval.currentStage !== stage || approval.status !== 'pending') {
      return false;
    }

    const stages: ApprovalStage[] = ['street', 'district', 'city'];
    const currentIndex = stages.indexOf(stage);
    const nextStage = stages[currentIndex + 1];
    const now = new Date().toISOString();

    const updatedApproval = { ...approval };

    if (stage === 'street') {
      updatedApproval.streetApprover = approver;
      updatedApproval.streetApproveTime = now;
      updatedApproval.streetOpinion = opinion;
    } else if (stage === 'district') {
      updatedApproval.districtApprover = approver;
      updatedApproval.districtApproveTime = now;
      updatedApproval.districtOpinion = opinion;
    } else if (stage === 'city') {
      updatedApproval.cityApprover = approver;
      updatedApproval.cityApproveTime = now;
      updatedApproval.cityOpinion = opinion;
    }

    if (nextStage) {
      updatedApproval.currentStage = nextStage;
      updatedApproval.status = 'pending';
    } else {
      updatedApproval.status = 'completed';
      updatedApproval.remark = '审批流程已完成，补贴已发放。';
    }

    set((state) => ({
      approvals: state.approvals.map((a) =>
        a.id === approvalId ? updatedApproval : a
      )
    }));

    return true;
  },

  rejectAtStage: (approvalId, stage, approver, opinion) => {
    const approval = get().getApprovalById(approvalId);
    if (!approval || approval.currentStage !== stage || approval.status !== 'pending') {
      return false;
    }

    const now = new Date().toISOString();
    const updatedApproval = { ...approval, status: 'rejected' as ApprovalStatus };

    if (stage === 'street') {
      updatedApproval.streetApprover = approver;
      updatedApproval.streetApproveTime = now;
      updatedApproval.streetOpinion = opinion;
    } else if (stage === 'district') {
      updatedApproval.districtApprover = approver;
      updatedApproval.districtApproveTime = now;
      updatedApproval.districtOpinion = opinion;
    } else if (stage === 'city') {
      updatedApproval.cityApprover = approver;
      updatedApproval.cityApproveTime = now;
      updatedApproval.cityOpinion = opinion;
    }

    set((state) => ({
      approvals: state.approvals.map((a) =>
        a.id === approvalId ? updatedApproval : a
      )
    }));

    return true;
  },

  getPendingCount: () => get().approvals.filter((a) => a.status === 'pending').length,

  getCompletedCount: () => get().approvals.filter((a) => a.status === 'completed').length,

  getRejectedCount: () => get().approvals.filter((a) => a.status === 'rejected').length
}));

export default useApprovalStore;
