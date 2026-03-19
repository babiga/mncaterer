"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type BookingServiceType =
  | "CORPORATE"
  | "PRIVATE"
  | "WEDDING"
  | "VIP"
  | "OTHER";

export interface BookingEventDetails {
  eventDate: string;
  eventTime: string;
  venue: string;
  venueAddress: string;
}

export interface BookingContactInfo {
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  specialRequests: string;
}

interface BookingState {
  // Step
  currentStep: number;

  // Step 1: Service Type
  serviceType: BookingServiceType | null;

  // Step 2: Menu & Chef
  selectedMenus: { menuId: string; guestCount: number }[];
  chefProfileId: string;

  // Step 3: Event Details
  eventDetails: BookingEventDetails;

  // Step 4: Contact & Notes
  contactInfo: BookingContactInfo;

  // Submission
  isSubmitting: boolean;
  isSubmitted: boolean;
  submissionError: string | null;

  // Actions
  setServiceType: (type: BookingServiceType) => void;
  toggleMenu: (menuId: string, defaultGuestCount?: number) => void;
  updateMenuGuestCount: (menuId: string, guestCount: number) => void;
  setChef: (chefId: string) => void;
  setEventDetails: (details: Partial<BookingEventDetails>) => void;
  setContactInfo: (info: Partial<BookingContactInfo>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  setSubmitting: (v: boolean) => void;
  setSubmitted: (v: boolean) => void;
  setSubmissionError: (err: string | null) => void;
  resetBooking: () => void;
}

const TOTAL_STEPS = 5;

const initialEventDetails: BookingEventDetails = {
  eventDate: "",
  eventTime: "18:00",
  venue: "",
  venueAddress: "",
};

const initialContactInfo: BookingContactInfo = {
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  specialRequests: "",
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      currentStep: 0,
      serviceType: null,
      selectedMenus: [],
      chefProfileId: "",
      eventDetails: { ...initialEventDetails },
      contactInfo: { ...initialContactInfo },
      isSubmitting: false,
      isSubmitted: false,
      submissionError: null,

      setServiceType: (type) =>
        set({ serviceType: type }),

      toggleMenu: (menuId, defaultGuestCount = 1) =>
        set((state) => {
          const exists = state.selectedMenus.some((m) => m.menuId === menuId);
          return {
            selectedMenus: exists
              ? state.selectedMenus.filter((m) => m.menuId !== menuId)
              : [...state.selectedMenus, { menuId, guestCount: defaultGuestCount }],
          };
        }),

      updateMenuGuestCount: (menuId, guestCount) =>
        set((state) => ({
          selectedMenus: state.selectedMenus.map((m) =>
            m.menuId === menuId ? { ...m, guestCount } : m
          ),
        })),

      setChef: (chefId) => set({ chefProfileId: chefId }),

      setEventDetails: (details) =>
        set((state) => ({
          eventDetails: { ...state.eventDetails, ...details },
        })),

      setContactInfo: (info) =>
        set((state) => ({
          contactInfo: { ...state.contactInfo, ...info },
        })),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, TOTAL_STEPS - 1),
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 0),
        })),

      goToStep: (step) =>
        set({ currentStep: Math.max(0, Math.min(step, TOTAL_STEPS - 1)) }),

      setSubmitting: (v) => set({ isSubmitting: v }),
      setSubmitted: (v) => set({ isSubmitted: v }),
      setSubmissionError: (err) => set({ submissionError: err }),

      resetBooking: () =>
        set({
          currentStep: 0,
          serviceType: null,
          selectedMenus: [],
          chefProfileId: "",
          eventDetails: { ...initialEventDetails },
          contactInfo: { ...initialContactInfo },
          isSubmitting: false,
          isSubmitted: false,
          submissionError: null,
        }),
    }),
    {
      name: "mnc-booking",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        serviceType: state.serviceType,
        selectedMenus: state.selectedMenus,
        chefProfileId: state.chefProfileId,
        eventDetails: state.eventDetails,
        contactInfo: state.contactInfo,
      }),
    },
  ),
);
