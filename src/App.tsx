/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { LostFoundView } from './views/LostFoundView';
import { ReportLostView } from './views/ReportLostView';
import { DonationsView } from './views/DonationsView';
import { MyReportsAndClaimsView } from './views/MyReportsAndClaimsView';
import { PEDepartmentView } from './views/PEDepartmentView';
import { TeacherDashboardView } from './views/TeacherDashboardView';
import { ProfileView } from './views/ProfileView';

import { LoginModal } from './components/LoginModal';
import { ItemDetailModal } from './components/ItemDetailModal';
import { ClaimModal } from './components/ClaimModal';
import { DonationDetailModal } from './components/DonationDetailModal';
import { DonateFormModal } from './components/DonateFormModal';
import { FoundItem, DonationItem } from './types';
import { api } from './services/api';
import { RoleSelectScreen } from './components/RoleSelectScreen';

function MainApp() {
  const { user, isTeacher, isLoading } = useAuth();

  // Navigation
  const [currentView, setCurrentView] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginDefaultTab, setLoginDefaultTab] = useState<'student' | 'teacher'>('student');

  const [selectedFoundItem, setSelectedFoundItem] = useState<FoundItem | null>(null);
  const [claimModalItem, setClaimModalItem] = useState<FoundItem | null>(null);

  const [selectedDonation, setSelectedDonation] = useState<DonationItem | null>(null);
  const [donateModalOpen, setDonateModalOpen] = useState(false);

  const openTeacherLogin = () => {
    setLoginDefaultTab('teacher');
    setLoginModalOpen(true);
  };

  const openStudentLogin = () => {
    setLoginDefaultTab('student');
    setLoginModalOpen(true);
  };

  const handleClaimItem = (item: FoundItem) => {
    if (!user) {
      openStudentLogin();
      return;
    }
    setClaimModalItem(item);
  };

  const handleRequestUnclaimed = async (item: FoundItem) => {
    if (!user) {
      openStudentLogin();
      return;
    }
    const reason = window.prompt(
      `Requesting unclaimed item: "${item.name}". Please state the educational or personal need:`
    );
    if (!reason || !reason.trim()) return;

    try {
      const res = await api.requestUnclaimedItem(item.id, reason.trim());
      alert(`Redistribution request submitted! Reference Code: ${res.referenceCode}. Awaiting staff review.`);
    } catch (err: any) {
      alert(err.message || 'Failed to submit request.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <RoleSelectScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenLogin={openStudentLogin}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentView === 'home' && (
          <HomeView
            onNavigate={setCurrentView}
            onSelectFoundItem={setSelectedFoundItem}
            onSelectDonation={setSelectedDonation}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenLogin={openStudentLogin}
          />
        )}

        {currentView === 'lost-found' && (
          <LostFoundView
            onSelectItem={setSelectedFoundItem}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onNavigateReport={() => setCurrentView('report-lost')}
          />
        )}

        {currentView === 'report-lost' && (
          <ReportLostView
            onNavigateHome={() => setCurrentView('home')}
            onNavigateMyClaims={() => setCurrentView('my-claims')}
            onSelectFoundItem={setSelectedFoundItem}
          />
        )}

        {currentView === 'donations' && (
          <DonationsView
            onSelectDonation={setSelectedDonation}
            onOpenDonateModal={() => setDonateModalOpen(true)}
          />
        )}

        {currentView === 'my-claims' && (
          <MyReportsAndClaimsView
            onSelectFoundItem={setSelectedFoundItem}
            onNavigateLostFound={() => setCurrentView('lost-found')}
          />
        )}

        {currentView === 'pe-desk' && (
          <PEDepartmentView
            onSelectItem={setSelectedFoundItem}
            onOpenTeacherLogin={openTeacherLogin}
          />
        )}

        {currentView === 'teacher-dashboard' && (
          <TeacherDashboardView
            onSelectItem={setSelectedFoundItem}
            onOpenTeacherLogin={openTeacherLogin}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            onNavigate={setCurrentView}
            onOpenLogin={openStudentLogin}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        defaultTab={loginDefaultTab}
      />

      <ItemDetailModal
        item={selectedFoundItem}
        isOpen={!!selectedFoundItem}
        onClose={() => setSelectedFoundItem(null)}
        onClaim={handleClaimItem}
        onRequestUnclaimed={handleRequestUnclaimed}
      />

      <ClaimModal
        item={claimModalItem}
        isOpen={!!claimModalItem}
        onClose={() => setClaimModalItem(null)}
        onClaimSubmitted={() => {
          // Can refresh or redirect to my claims
        }}
      />

      <DonationDetailModal
        donation={selectedDonation}
        isOpen={!!selectedDonation}
        onClose={() => setSelectedDonation(null)}
        onRequestSubmitted={() => {
          // Refresh callback
        }}
      />

      <DonateFormModal
        isOpen={donateModalOpen}
        onClose={() => setDonateModalOpen(false)}
        onDonationCreated={() => {
          // Refresh callback
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainApp />
      </NotificationProvider>
    </AuthProvider>
  );
}
