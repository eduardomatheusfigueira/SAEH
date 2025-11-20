import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DetailModal from '../DetailModal';

describe('DetailModal Component', () => {
  const onCloseMock = vi.fn();

  it('should render nothing if entityData is null', () => {
    const { container } = render(
      <DetailModal entityData={null} entityType="event" onClose={onCloseMock} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('should render event details correctly', () => {
    const eventData = {
      id: 'e1',
      title: 'Test Event',
      description_short: 'A short description',
      start_date: '2023-01-01',
      end_date: '2023-01-02',
    };

    render(<DetailModal entityData={eventData} entityType="event" onClose={onCloseMock} />);

    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('A short description')).toBeInTheDocument();
    expect(screen.getByText('2023-01-01')).toBeInTheDocument();
    expect(screen.getByText('2023-01-02')).toBeInTheDocument();
    expect(screen.getByText(/ID: e1/)).toBeInTheDocument();
  });

  it('should render theme details correctly', () => {
    const themeData = {
      id: 't1',
      name: 'Test Theme',
      color: '#ff0000',
    };

    render(<DetailModal entityData={themeData} entityType="theme" onClose={onCloseMock} />);

    expect(screen.getByText('Test Theme')).toBeInTheDocument();
    expect(screen.getByText('#ff0000')).toBeInTheDocument();
  });

  it('should render source details correctly', () => {
      const sourceData = {
          id: 's1',
          name: 'Test Source',
          description_short: 'Source Desc',
          color: '#00ff00'
      };

      render(<DetailModal entityData={sourceData} entityType="source" onClose={onCloseMock} />);

      expect(screen.getByText('Fonte: Test Source')).toBeInTheDocument();
      expect(screen.getByText('Source Desc')).toBeInTheDocument();
      expect(screen.getByText('#00ff00')).toBeInTheDocument();
  });

  it('should render article content when available', () => {
    const eventWithArticle = {
      id: 'e2',
      title: 'Event with Article',
      article_full: {
        current: '## Article Title\n\nSome content.',
      },
    };

    render(<DetailModal entityData={eventWithArticle} entityType="event" onClose={onCloseMock} />);

    expect(screen.getByText('Article Title')).toBeInTheDocument(); // H2 from markdown
    expect(screen.getByText('Some content.')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const eventData = { id: 'e1', title: 'Test Event' };
    render(<DetailModal entityData={eventData} entityType="event" onClose={onCloseMock} />);

    const closeButton = screen.getByText('Fechar');
    fireEvent.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
