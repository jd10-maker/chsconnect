import {
  FoundItem,
  LostReport,
  OwnershipClaim,
  DonationItem,
  DonationRequest,
  UnclaimedRequest,
  AppNotification,
  AuditLog,
  SchoolSettings,
  User,
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('school_lf_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  // Auth
  async loginStudent(email: string, currentClass: string, name?: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/student-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, currentClass, name }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to sign in as student.');
    }
    return res.json();
  },

  async loginTeacher(email: string, password: string, facultyCode: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/teacher-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, facultyCode }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to sign in as faculty.');
    }
    return res.json();
  },

  async registerTeacher(
    name: string,
    email: string,
    password: string,
    department: string,
    facultyCode: string
  ): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/teacher-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, department, facultyCode }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to register teacher account.');
    }
    return res.json();
  },

  async updateStudentClass(currentClass: string): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/student-update-class`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentClass }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update class.');
    }
    return res.json();
  },

  async getMe(): Promise<{ user: User | null }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return { user: null };
    return res.json();
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch (e) {
      console.warn('Logout request warning:', e);
    }
  },

  // Settings
  async getSettings(): Promise<SchoolSettings> {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load settings.');
    return res.json();
  },

  async updateSettings(settings: Partial<SchoolSettings>): Promise<{ settings: SchoolSettings }> {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update settings.');
    }
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load audit logs.');
    return res.json();
  },

  // Found Items
  async getFoundItems(params?: {
    search?: string;
    category?: string;
    location?: string;
    status?: string;
    daysFilter?: string;
  }): Promise<FoundItem[]> {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.category) q.append('category', params.category);
    if (params?.location) q.append('location', params.location);
    if (params?.status) q.append('status', params.status);
    if (params?.daysFilter) q.append('daysFilter', params.daysFilter);

    const res = await fetch(`${API_BASE}/found-items?${q.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load found items.');
    return res.json();
  },

  async getFoundItem(id: string): Promise<FoundItem> {
    const res = await fetch(`${API_BASE}/found-items/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Item not found.');
    return res.json();
  },

  async createFoundItem(item: Partial<FoundItem>): Promise<FoundItem> {
    const res = await fetch(`${API_BASE}/found-items`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to publish found item.');
    }
    return res.json();
  },

  async updateFoundItem(id: string, updates: Partial<FoundItem>): Promise<FoundItem> {
    const res = await fetch(`${API_BASE}/found-items/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update found item.');
    }
    return res.json();
  },

  async deleteFoundItem(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/found-items/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to remove item.');
  },

  // Lost Reports
  async submitLostReport(report: Partial<LostReport>): Promise<LostReport> {
    const res = await fetch(`${API_BASE}/lost-reports`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(report),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit lost report.');
    }
    return res.json();
  },

  async getMyLostReports(): Promise<LostReport[]> {
    const res = await fetch(`${API_BASE}/lost-reports/my`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load your lost reports.');
    return res.json();
  },

  async getAllLostReports(): Promise<LostReport[]> {
    const res = await fetch(`${API_BASE}/lost-reports`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load lost reports.');
    return res.json();
  },

  async updateLostReport(id: string, updates: Partial<LostReport>): Promise<LostReport> {
    const res = await fetch(`${API_BASE}/lost-reports/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update report.');
    }
    return res.json();
  },

  async getReportMatches(reportId: string): Promise<FoundItem[]> {
    const res = await fetch(`${API_BASE}/lost-reports/${reportId}/matches`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  // Claims
  async submitClaim(claim: {
    foundItemId: string;
    description?: string;
    privateDetailsEvidence: string;
    photoProof?: string;
    contactNumber?: string;
  }): Promise<OwnershipClaim> {
    const res = await fetch(`${API_BASE}/claims`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(claim),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit claim.');
    }
    return res.json();
  },

  async getMyClaims(): Promise<OwnershipClaim[]> {
    const res = await fetch(`${API_BASE}/claims/my`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load your claims.');
    return res.json();
  },

  async getAllClaims(): Promise<OwnershipClaim[]> {
    const res = await fetch(`${API_BASE}/claims`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load claims.');
    return res.json();
  },

  async reviewClaim(
    claimId: string,
    action: 'approve' | 'reject' | 'request_evidence',
    feedback?: string,
    collectionInstructions?: string
  ): Promise<OwnershipClaim> {
    const res = await fetch(`${API_BASE}/claims/${claimId}/review`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action, feedback, collectionInstructions }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to review claim.');
    }
    return res.json();
  },

  async addClaimEvidence(claimId: string, additionalEvidence: string, photoProof?: string): Promise<OwnershipClaim> {
    const res = await fetch(`${API_BASE}/claims/${claimId}/add-evidence`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ additionalEvidence, photoProof }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit additional evidence.');
    }
    return res.json();
  },

  // Handover
  async confirmHandover(claimId: string, verifiedStudentId: boolean, notes?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/handover`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ claimId, verifiedStudentId, notes }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to record handover.');
    }
    return res.json();
  },

  // 15-Day Unclaimed
  async requestUnclaimedItem(foundItemId: string, reason: string): Promise<UnclaimedRequest> {
    const res = await fetch(`${API_BASE}/unclaimed-items/${foundItemId}/request`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit request.');
    }
    return res.json();
  },

  async getUnclaimedRequests(): Promise<UnclaimedRequest[]> {
    const res = await fetch(`${API_BASE}/unclaimed-requests`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load redistribution requests.');
    return res.json();
  },

  async reviewUnclaimedRequest(requestId: string, action: 'approve' | 'reject', notes?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/unclaimed-requests/${requestId}/review`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action, notes }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to review request.');
    }
    return res.json();
  },

  async handoverUnclaimedRequest(requestId: string, verifiedStudentId: boolean, notes?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/unclaimed-requests/${requestId}/handover`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ verifiedStudentId, notes }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to record handover.');
    }
    return res.json();
  },

  // Donations
  async getDonations(params?: {
    category?: string;
    donorType?: string;
    condition?: string;
    search?: string;
  }): Promise<DonationItem[]> {
    const q = new URLSearchParams();
    if (params?.category) q.append('category', params.category);
    if (params?.donorType) q.append('donorType', params.donorType);
    if (params?.condition) q.append('condition', params.condition);
    if (params?.search) q.append('search', params.search);

    const res = await fetch(`${API_BASE}/donations?${q.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load donations.');
    return res.json();
  },

  async createDonation(donation: Partial<DonationItem>): Promise<DonationItem> {
    const res = await fetch(`${API_BASE}/donations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(donation),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create donation.');
    }
    return res.json();
  },

  async updateDonation(id: string, updates: Partial<DonationItem>): Promise<DonationItem> {
    const res = await fetch(`${API_BASE}/donations/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update donation.');
    }
    return res.json();
  },

  async requestDonation(donationId: string, reason: string): Promise<DonationRequest> {
    const res = await fetch(`${API_BASE}/donations/${donationId}/request`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit donation request.');
    }
    return res.json();
  },

  async getMyDonationRequests(): Promise<DonationRequest[]> {
    const res = await fetch(`${API_BASE}/donations/my-requests`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load your donation requests.');
    return res.json();
  },

  async getAllDonationRequests(): Promise<DonationRequest[]> {
    const res = await fetch(`${API_BASE}/donations/requests`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load donation requests.');
    return res.json();
  },

  async reviewDonationRequest(requestId: string, action: 'approve' | 'reject'): Promise<any> {
    const res = await fetch(`${API_BASE}/donations/requests/${requestId}/review`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to review donation request.');
    }
    return res.json();
  },

  async handoverDonation(requestId: string, verifiedStudentId: boolean, notes?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/donations/requests/${requestId}/handover`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ verifiedStudentId, notes }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to record donation handover.');
    }
    return res.json();
  },

  // P.E. Desk
  async getPEDeskSummary(): Promise<any> {
    const res = await fetch(`${API_BASE}/pe-desk/summary`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load P.E. desk metrics.');
    return res.json();
  },

  async lookupCode(code: string): Promise<any> {
    const res = await fetch(`${API_BASE}/pe-desk/lookup/${encodeURIComponent(code)}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'No matching record found.');
    }
    return res.json();
  },

  // Notifications
  async getNotifications(): Promise<AppNotification[]> {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  async markAllNotificationsRead(): Promise<void> {
    await fetch(`${API_BASE}/notifications/mark-all-read`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },
};
