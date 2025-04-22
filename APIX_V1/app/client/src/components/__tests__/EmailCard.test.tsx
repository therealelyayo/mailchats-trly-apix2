import React from 'react';
import { render, screen } from '../../__tests__/setup/test-utils';
import { EmailCard } from '../EmailCard';

describe('EmailCard Component', () => {
  const mockEmail = {
    id: 1,
    email: 'test@example.com',
    subject: 'Test Email Subject',
    sent: true,
    delivered: true,
    opened: false,
    clicked: false,
    replied: false,
    failed: false,
    sentAt: new Date('2024-04-20T10:00:00')
  };

  const mockResend = jest.fn();

  test('renders email card with correct information', () => {
    render(<EmailCard {...mockEmail} />);
    
    // Check if email and subject are displayed
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Test Email Subject')).toBeInTheDocument();
    
    // Check if status badge is displayed
    expect(screen.getByText('Sent')).toBeInTheDocument();
    
    // Check if sent date is displayed
    expect(screen.getByText(/Sent:/)).toBeInTheDocument();
  });

  test('shows the correct status badge for delivered email', () => {
    render(<EmailCard {...mockEmail} delivered={true} />);
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });

  test('shows the correct status badge for opened email', () => {
    render(<EmailCard {...mockEmail} opened={true} openedAt={new Date('2024-04-20T11:00:00')} />);
    expect(screen.getByText('Opened')).toBeInTheDocument();
    expect(screen.getByText(/Opened:/)).toBeInTheDocument();
  });

  test('shows the correct status badge for clicked email', () => {
    render(<EmailCard {...mockEmail} clicked={true} clickedAt={new Date('2024-04-20T12:00:00')} />);
    expect(screen.getByText('Clicked')).toBeInTheDocument();
    expect(screen.getByText(/Clicked:/)).toBeInTheDocument();
  });

  test('shows the correct status badge for replied email', () => {
    render(<EmailCard {...mockEmail} replied={true} repliedAt={new Date('2024-04-20T13:00:00')} />);
    expect(screen.getByText('Replied')).toBeInTheDocument();
    expect(screen.getByText(/Replied:/)).toBeInTheDocument();
  });

  test('shows resend button for failed emails', async () => {
    render(<EmailCard {...mockEmail} failed={true} sent={false} onResend={mockResend} />);
    
    expect(screen.getByText('Failed')).toBeInTheDocument();
    
    const resendButton = screen.getByTestId('resend-button-1');
    expect(resendButton).toBeInTheDocument();
    
    // Click the resend button
    resendButton.click();
    
    // Check if the onResend callback was called with the correct ID
    expect(mockResend).toHaveBeenCalledWith(1);
  });

  test('shows pending status for unsent emails', () => {
    render(<EmailCard {...mockEmail} sent={false} delivered={false} />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
  });
});