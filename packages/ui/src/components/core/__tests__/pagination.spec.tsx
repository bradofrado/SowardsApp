import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { RenderResult } from '@testing-library/react';
import { Pagination } from '../pagination';

describe('Pagination', () => {
  it('should not render when total pages is 1', () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        onPageChange={() => undefined}
        totalPages={1}
      />
    ) as RenderResult;
    expect(container.firstChild).toBeNull();
  });

  it('should render current page with correct styling', () => {
    render(
      <Pagination
        currentPage={5}
        onPageChange={() => undefined}
        totalPages={10}
      />
    );

    const currentPage = screen.getByText('5');
    expect(currentPage).toBeInTheDocument();
    expect(currentPage).toHaveClass('bg-blue-500');
  });

  it('should show correct range of pages around current page', () => {
    render(
      <Pagination
        currentPage={5}
        onPageChange={() => undefined}
        totalPages={10}
      />
    );

    // Should show pages 4,5,6 (1 before and 1 after current)
    [4, 5, 6].forEach((pageNum) => {
      const pageButton = screen.getByText(pageNum.toString());
      expect(pageButton).toBeInTheDocument();
    });
  });

  it('should call onPageChange with correct page number', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={5} onPageChange={onPageChange} totalPages={10} />
    );

    const nextPage = screen.getByText('6');
    fireEvent.click(nextPage);
    expect(onPageChange).toHaveBeenCalledWith(6);
  });

  it('should show ellipsis when pages are not consecutive', () => {
    render(
      <Pagination
        currentPage={5}
        onPageChange={() => undefined}
        totalPages={10}
      />
    );

    const ellipses = screen.getAllByText('...');
    expect(ellipses).toHaveLength(2); // One before and one after the current range
  });

  it('should handle start of range correctly', () => {
    render(
      <Pagination
        currentPage={1}
        onPageChange={() => undefined}
        totalPages={10}
      />
    );

    // Should show pages 1,2 and ellipsis
    [1, 2].forEach((pageNum) => {
      const pageButton = screen.getByText(pageNum.toString());
      expect(pageButton).toBeInTheDocument();
    });
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('should handle end of range correctly', () => {
    render(
      <Pagination
        currentPage={10}
        onPageChange={() => undefined}
        totalPages={10}
      />
    );

    // Should show pages 9,10 and ellipsis
    [9, 10].forEach((pageNum) => {
      const pageButton = screen.getByText(pageNum.toString());
      expect(pageButton).toBeInTheDocument();
    });
    expect(screen.getByText('...')).toBeInTheDocument();
  });
});
