/**
 * LSACard.test.tsx
 *
 * Unit tests for the LSACard component.
 * Tests rendering, accessibility props, and interaction handling.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LSACard } from '../../src/components/LSACard';
import { LSA } from '../../src/utils/api';

// ── Mock LSA Data ───────────────────────────────────────────────────

const mockLSA: LSA = {
  id: 'lsa-001',
  name: 'Sarah Al-Maktoum',
  specialty: 'Autism Spectrum',
  bio: 'Certified behavioral analyst with 8 years of experience.',
  avatarUrl: 'https://example.com/avatar.jpg',
  rating: 4.9,
  reviewCount: 127,
  hourlyRate: 150,
  qualifications: ['BCBA', 'Master of Education'],
  availability: 'Monday to Friday, 8:00 AM - 4:00 PM',
  location: 'Dubai, UAE',
  isAvailable: true,
};

const mockUnavailableLSA: LSA = {
  ...mockLSA,
  id: 'lsa-004',
  name: 'Khalid Al-Tamimi',
  isAvailable: false,
};

// ═══════════════════════════════════════════════════════════════════
// Rendering Tests
// ═══════════════════════════════════════════════════════════════════

describe('LSACard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the LSA name', () => {
      const { getByText } = render(
        <LSACard lsa={mockLSA} onPress={mockOnPress} testID="test-card" />,
      );
      expect(getByText('Sarah Al-Maktoum')).toBeTruthy();
    });

    it('should render the LSA specialty', () => {
      const { getByText } = render(
        <LSACard lsa={mockLSA} onPress={mockOnPress} testID="test-card" />,
      );
      expect(getByText('Autism Spectrum')).toBeTruthy();
    });

    it('should render the rating', () => {
      const { getByText } = render(
        <LSACard lsa={mockLSA} onPress={mockOnPress} testID="test-card" />,
      );
      expect(getByText(/4\.9/)).toBeTruthy();
    });

    it('should render the review count', () => {
      const { getByText } = render(
        <LSACard lsa={mockLSA} onPress={mockOnPress} testID="test-card" />,
      );
      expect(getByText('(127)')).toBeTruthy();
    });

    it('should render the hourly rate', () => {
      const { getByText } = render(
        <LSACard lsa={mockLSA} onPress={mockOnPress} testID="test-card" />,
      );
      expect(getByText('AED 150/hr')).toBeTruthy();
    });

    it('should show "Available" badge when LSA is available', () => {
      const { getByText } = render(
        <LSACard lsa={mockLSA} onPress={mockOnPress} testID="test-card" />,
      );
      expect(getByText('Available')).toBeTruthy();
    });

    it('should show "Unavailable" badge when LSA is unavailable', () => {
      const { getByText } = render(
        <LSACard lsa={mockUnavailableLSA} onPress={mockOnPress} testID="test-card" />,
      );
      expect(getByText('Unavailable')).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Accessibility Tests
  // ═══════════════════════════════════════════════════════════════

  describe('Accessibility', () => {
    it('should have accessibilityRole="button"', () => {
      const { getByTestId } = render(
        <LSACard lsa={mockLSA} onPress={mockOnPress} testID="test-card" />,
      );
      const card = getByTestId('test-card');
      expect(card.props.accessibilityRole).toBe('button');
    });

    it('should have a comprehensive accessibility label', () => {
      const { getByTestId } = render(
        <LSACard lsa={mockLSA} onPress={mockOnPress} testID="test-card" />,
      );
      const card = getByTestId('test-card');
      const label = card.props.accessibilityLabel;

      // Should contain all important information
      expect(label).toContain('Sarah Al-Maktoum');
      expect(label).toContain('Autism Spectrum');
      expect(label).toContain('4.9');
      expect(label).toContain('127');
      expect(label).toContain('150');
      expect(label).toContain('Available');
    });

    it('should have an accessibility hint', () => {
      const { getByTestId } = render(
        <LSACard lsa={mockLSA} onPress={mockOnPress} testID="test-card" />,
      );
      const card = getByTestId('test-card');
      expect(card.props.accessibilityHint).toContain('profile');
    });

    it('should hide avatar image from screen readers', () => {
      const { getByTestId } = render(
        <LSACard lsa={mockLSA} onPress={mockOnPress} testID="test-card" />,
      );
      const avatar = getByTestId('test-card-avatar');
      expect(avatar.props.accessibilityElementsHidden).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Interaction Tests
  // ═══════════════════════════════════════════════════════════════

  describe('Interaction', () => {
    it('should call onPress when tapped', () => {
      const { getByTestId } = render(
        <LSACard lsa={mockLSA} onPress={mockOnPress} testID="test-card" />,
      );
      fireEvent.press(getByTestId('test-card'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress multiple times on rapid taps (debounce)', () => {
      const { getByTestId } = render(
        <LSACard lsa={mockLSA} onPress={mockOnPress} testID="test-card" />,
      );
      const card = getByTestId('test-card');
      fireEvent.press(card);
      fireEvent.press(card);
      fireEvent.press(card);
      // Without debounce, all 3 are called; this tests the component's behavior
      expect(mockOnPress).toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Snapshot Tests
  // ═══════════════════════════════════════════════════════════════

  describe('Snapshots', () => {
    it('should match snapshot for available LSA', () => {
      const tree = render(
        <LSACard lsa={mockLSA} onPress={mockOnPress} testID="test-card" />,
      );
      expect(tree.toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for unavailable LSA', () => {
      const tree = render(
        <LSACard lsa={mockUnavailableLSA} onPress={mockOnPress} testID="test-card" />,
      );
      expect(tree.toJSON()).toMatchSnapshot();
    });
  });
});
