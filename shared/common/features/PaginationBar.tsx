"use client";

import clsx from "clsx";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

type PageItem = number | "ellipsis";

const buildPageItems = (
    currentPage: number,
    totalPages: number,
    maxVisible: number
): PageItem[] => {
    if (totalPages <= 1) return [1];
    if (totalPages <= maxVisible + 2) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set<number>();
    pages.add(1);
    pages.add(totalPages);

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(2, currentPage - half);
    let end = Math.min(totalPages - 1, currentPage + half);

    if (currentPage <= 1 + half) {
        start = 2;
        end = 1 + maxVisible;
    } else if (currentPage >= totalPages - half) {
        end = totalPages - 1;
        start = totalPages - maxVisible;
    }

    start = Math.max(2, start);
    end = Math.min(totalPages - 1, end);

    for (let i = start; i <= end; i += 1) {
        pages.add(i);
    }

    const sorted = Array.from(pages).sort((a, b) => a - b);
    const items: PageItem[] = [];
    let prev = 0;
    for (const page of sorted) {
        if (prev && page - prev > 1) {
            items.push("ellipsis");
        }
        items.push(page);
        prev = page;
    }
    return items;
};

const PaginationBar = ({
    currentPage,
    totalPages,
    onPageChange,
    maxVisible = 5,
    className,
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    maxVisible?: number;
    className?: string;
}) => {
    const items = buildPageItems(currentPage, totalPages, maxVisible);
    const canGoPrev = currentPage > 1;
    const canGoNext = currentPage < totalPages;
    const itemClassName = clsx(
        "rounded-md border border-blue-200 bg-blue-50 text-blue-700 shadow-md shadow-blue-200/60",
        "transition-all duration-300 hover:scale-95 hover:bg-blue-100/80",
        "dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100 dark:shadow-none dark:hover:bg-slate-800/70"
    );
    const activeItemClassName = clsx(
        "bg-linear-to-r from-[#009ad5] to-[#005ca9] text-white",
        "hover:from-[#009ad5] hover:to-[#005ca9]"
    );

    return (
        <Pagination className={className}>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        className={clsx(itemClassName, !canGoPrev && "pointer-events-none opacity-50")}
                        onClick={(event) => {
                            event.preventDefault();
                            if (canGoPrev) onPageChange(currentPage - 1);
                        }}
                    />
                </PaginationItem>

                {items.map((item, index) => {
                    if (item === "ellipsis") {
                        return (
                            <PaginationItem key={`ellipsis-${index}`}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        );
                    }
                    return (
                        <PaginationItem key={item}>
                            <PaginationLink
                                href="#"
                                isActive={item === currentPage}
                                className={clsx(
                                    itemClassName,
                                    item === currentPage && activeItemClassName
                                )}
                                onClick={(event) => {
                                    event.preventDefault();
                                    if (item !== currentPage) {
                                        onPageChange(item);
                                    }
                                }}
                            >
                                {item}
                            </PaginationLink>
                        </PaginationItem>
                    );
                })}

                <PaginationItem>
                    <PaginationNext
                        href="#"
                        className={clsx(itemClassName, !canGoNext && "pointer-events-none opacity-50")}
                        onClick={(event) => {
                            event.preventDefault();
                            if (canGoNext) onPageChange(currentPage + 1);
                        }}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};

export default PaginationBar;