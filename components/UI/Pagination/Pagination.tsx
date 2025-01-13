import { useState } from "react";

interface PaginationProps {
  length: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
}

const Pagination: React.FC<PaginationProps> = ({
  length,
  onPageChange,
  itemsPerPage,
}) => {
  const totalPages = Math.ceil(length / itemsPerPage);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageNumber, setPageNumber] = useState<number | string>("");

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    onPageChange(page);
  };

  const handleNext = () => {
    goToPage(currentPage + 1);
  };

  const handlePrev = () => {
    goToPage(currentPage - 1);
  };

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseInt(e.target.value);
    if (isNaN(inputValue) || inputValue < 1 || inputValue > totalPages) {
      setPageNumber("");
      return;
    }
    setPageNumber(inputValue);
  };

  const handleGoToSubmission = () => {
    if (typeof pageNumber === "number") {
      goToPage(pageNumber);
    }
  };

  return (
    <div className="pagination">
      <div className="pagination-left">
        <button
          className="pagination-change"
          onClick={handlePrev}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="pagination-change"
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
      <div className="pagination-right">
        <input
          type="number"
          min="1"
          max={totalPages}
          value={pageNumber}
          onChange={handlePageInput}
        />
        <button onClick={handleGoToSubmission}>Go</button>
      </div>
    </div>
  );
};

export default Pagination;
