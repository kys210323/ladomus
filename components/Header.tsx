"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { usePathname } from "next/navigation";

interface IPage {
  id: number;
  parentId: number | null;
  type: "page" | "board" | "hidden";
  template?: string;
  title: string;
  slug: string;
  content: string;
  sortOrder?: number;
  children?: IPage[];
}

// 상위/자식 경로 체크 함수
function isActiveOrChild(pageSlug: string, currentPath: string): boolean {
  if (currentPath === pageSlug) return true;
  if (currentPath.startsWith(pageSlug + "/")) return true;
  return false;
}

export default function Header() {
  const [allPages, setAllPages] = useState<IPage[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathname = usePathname();

  // 메뉴 데이터 로드
  useEffect(() => {
    async function loadParents() {
      try {
        const res = await fetch("/admin/pages/api/hierarchy");
        if (res.ok) {
          const data: IPage[] = await res.json();

          // (★) hidden 제외
          const filtered = data
            .filter((p) => p.type !== "hidden")
            .map((p) => {
              // 자식도 hidden 제외
              if (p.children && p.children.length > 0) {
                p.children = p.children.filter((c) => c.type !== "hidden");
              }
              return p;
            });

          setAllPages(filtered);
        }
      } catch (err) {
        console.error("헤더 상위 페이지 로드 실패:", err);
      }
    }
    loadParents();
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header
      className="fixed top-0 left-0 w-full z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
    >
      {/* 헤더 바 */}
      <div className="max-w-[1280px] mx-auto px-4 flex items-center justify-between py-2 xl:py-6 transition-all">
        {/* 로고 */}
        <div>
          <Link href="/">
            <Image
              src="/images/logo.png"
              alt="로고"
              width={100}
              height={40}
              className="object-contain xl:w-[240px] xl:h-[90px]"
            />
          </Link>
        </div>

        {/* PC 메뉴 (xl 이상) */}
        <nav className="hidden xl:flex items-center space-x-4">
          {allPages.map((page) => {
            const parentActive = isActiveOrChild(page.slug, pathname);

            return (
              <div key={page.id} className="relative group">
                <Link
                  href={page.slug}
                  className={`
                    font-medium px-2 py-1 text-lg transition-colors
                    ${
                      parentActive
                        ? "text-[#c8b8a8]"
                        : "text-[#e8e3d9] hover:text-[#c8b8a8]"
                    }
                  `}
                >
                  {page.title}
                </Link>

                {/* 자식 메뉴 (CSS :hover) - 옵셔널 체이닝 */}
                {page.children && page.children.length > 0 && (
                  <div
                    className="
                      absolute left-0 top-full
                      hidden group-hover:block
                      bg-black/90
                      min-w-[180px] p-2
                    "
                  >
                    {page.children?.map((child) => {
                      const childActive = isActiveOrChild(child.slug, pathname);
                      return (
                        <Link
                          key={child.id}
                          href={child.slug}
                          className={`
                            block px-3 py-2 text-base transition-colors
                            ${
                              childActive
                                ? "text-[#c8b8a8]"
                                : "text-[#e8e3d9] hover:text-[#c8b8a8]"
                            }
                          `}
                        >
                          {child.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* 모바일 햄버거 (xl 미만) */}
        <button onClick={toggleMobileMenu} className="xl:hidden text-white">
          {mobileMenuOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* 모바일 드롭다운 (xl 미만) */}
      {mobileMenuOpen && (
        <div className="xl:hidden flex flex-col bg-black text-white px-4 py-2">
          {allPages.map((page) => {
            const parentActive = isActiveOrChild(page.slug, pathname);

            return (
              <div key={page.id} className="mb-2">
                <Link
                  href={page.slug}
                  className={`
                    py-1 block font-medium text-lg transition-colors
                    ${
                      parentActive
                        ? "text-[#c8b8a8]"
                        : "text-[#e8e3d9] hover:text-[#c8b8a8]"
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {page.title}
                </Link>

                {/* 자식 메뉴 - 옵셔널 체이닝 */}
                {page.children?.map((child) => {
                  const childActive = isActiveOrChild(child.slug, pathname);
                  return (
                    <Link
                      key={child.id}
                      href={child.slug}
                      className={`
                        block ml-4 py-1 text-sm transition-colors
                        ${
                          childActive
                            ? "text-[#c8b8a8]"
                            : "text-[#e8e3d9] hover:text-[#c8b8a8]"
                        }
                      `}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {child.title}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </header>
  );
}
