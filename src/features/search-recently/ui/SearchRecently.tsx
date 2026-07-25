import Input from "@/shared/ui/Input";
import { useEffect, useMemo, useRef, useState } from "react";
import ClearIcon from '@mui/icons-material/Clear';
import { useClickOutside } from "@/shared/hooks/useClickOutside/useClickOutside";
import gsap from 'gsap'

type RecentItem = {
  id: string;
  name: string;
};

// Seeded so every entry matches something in the catalog when applied.
const CONST_RECENT: RecentItem[] = [
  { id: '1', name: "Apples" },
  { id: '2', name: "Bananas" },
  { id: '3', name: "Milk" },
  { id: '4', name: "Spinach" },
  { id: '5', name: "Croissant" },
]

interface SearchRecentlyProps {
  // The query is owned by the page, so the catalog below can react to it.
  value: string;
  onValueChange: (value: string) => void;
}

export default function SearchRecently({ value, onValueChange }: SearchRecentlyProps) {
  const [recent, setRecent] = useState<RecentItem[]>(CONST_RECENT);
  const [focused, setFocused] = useState(false);
  const [edit, setEdit] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null)

  useClickOutside(wrapperRef as React.RefObject<HTMLElement>, () => { setEdit(false); setFocused(false) })

  const visibleRecent = useMemo(() => {
    if (!value.trim()) return recent.slice(0, 5);
    return recent
      .filter(item => item.name.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 5);
  }, [value, recent]);


  const toggleEditMode = () => {
    setEdit((prev) => !prev)
  }

  const deleteRecentItem = (id: string) => {
    const updated = [...recent.filter((item) => item.id !== id)];
    setRecent(updated)
  }

  const handleItem = (name: string) => {
    if (edit) return

    onValueChange(name);
    setFocused(false)
  }

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current;
    if (focused) {
      gsap.fromTo(el,
        { opacity: 0, y: -8, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "power2.out" }
      );
    } else {
      gsap.to(el, { opacity: 0, y: -8, scale: 0.98, duration: 0.25, ease: "power2.in" });
    }
  }, [focused, visibleRecent]);

  return (
    <div ref={wrapperRef} className="relative z-50">
      <Input value={value} placeholder="Find groceries,or fresh product" name="search" handleChange={(e) => onValueChange(e.target.value)}
        onFocus={() => setFocused(true)}
      >
        <div className="flex items-center gap-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20.9999 20.9999L16.6499 16.6499" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg className="cursor-pointer" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={toggleEditMode}>
            <path d="M21.25 11.9999H8.895M4.534 11.9999H2.75M4.534 11.9999C4.534 11.4217 4.76368 10.8672 5.17251 10.4584C5.58134 10.0496 6.13583 9.81989 6.714 9.81989C7.29217 9.81989 7.84666 10.0496 8.25549 10.4584C8.66432 10.8672 8.894 11.4217 8.894 11.9999C8.894 12.5781 8.66432 13.1326 8.25549 13.5414C7.84666 13.9502 7.29217 14.1799 6.714 14.1799C6.13583 14.1799 5.58134 13.9502 5.17251 13.5414C4.76368 13.1326 4.534 12.5781 4.534 11.9999ZM21.25 18.6069H15.502M15.502 18.6069C15.502 19.1852 15.2718 19.7403 14.8628 20.1492C14.4539 20.5582 13.8993 20.7879 13.321 20.7879C12.7428 20.7879 12.1883 20.5572 11.7795 20.1484C11.3707 19.7396 11.141 19.1851 11.141 18.6069M15.502 18.6069C15.502 18.0286 15.2718 17.4745 14.8628 17.0655C14.4539 16.6566 13.8993 16.4269 13.321 16.4269C12.7428 16.4269 12.1883 16.6566 11.7795 17.0654C11.3707 17.4742 11.141 18.0287 11.141 18.6069M11.141 18.6069H2.75M21.25 5.39289H18.145M13.784 5.39289H2.75M13.784 5.39289C13.784 4.81472 14.0137 4.26023 14.4225 3.8514C14.8313 3.44257 15.3858 3.21289 15.964 3.21289C16.2503 3.21289 16.5338 3.26928 16.7983 3.37883C17.0627 3.48839 17.3031 3.64897 17.5055 3.8514C17.7079 4.05383 17.8685 4.29415 17.9781 4.55864C18.0876 4.82313 18.144 5.10661 18.144 5.39289C18.144 5.67917 18.0876 5.96265 17.9781 6.22714C17.8685 6.49163 17.7079 6.73195 17.5055 6.93438C17.3031 7.13681 17.0627 7.29739 16.7983 7.40695C16.5338 7.5165 16.2503 7.57289 15.964 7.57289C15.3858 7.57289 14.8313 7.34321 14.4225 6.93438C14.0137 6.52555 13.784 5.97106 13.784 5.39289Z" stroke="black" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" />
          </svg>
        </div>
      </Input>

      {/* Recent searches */}
      {focused && (
        <ul ref={listRef} className="absolute w-full flex flex-col bg-white p-3 rounded-xl shadow-md mt-2">
          <div className="flex justify-between items-center mb-2">
            <h4 className="h4-bold text-black">Recent searches</h4>
            <button className="small-regular" onClick={(e) => { e.stopPropagation(); toggleEditMode(); }}>edit</button>
          </div>
          {visibleRecent.length > 0 ? (
            visibleRecent.map(item => (
              <RecentItem
                key={item.id}
                item={item}
                edit={edit}
                handleItem={handleItem}
                deleteRecentItem={deleteRecentItem}
              />
            ))
          ) : (
            <li className="small-regular text-black p-2" data-testid="no-recent">
              No recent searches match
            </li>
          )}
        </ul>
      )}

    </div>
  )
}
type RecentItemProps = {
  item: RecentItem;
  edit: boolean;
  handleItem: (name: string) => void;
  deleteRecentItem: (id: string) => void;
};


const RecentItem = ({ item, edit, handleItem, deleteRecentItem }: RecentItemProps) => {
  const clearRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!edit || !clearRef.current) return;

    const anim = gsap.to(clearRef.current, {
      rotate: 5,
      duration: 0.1,
      yoyo: true,
      repeat: -1,
      ease: "power1.inOut"
    });

    const cleanup = () => {
      anim.kill();
    };

    return cleanup;
  }, [edit]);


  return (
    <li
      className="relative"
      onClick={() => handleItem(item.name)}
    >
      <div className="transition-colors ease-in-out rounded-xl hover:bg-flash-white cursor-pointer text-left w-full p-2 text-black flex items-center gap-[5px] border-b border-flash-white">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.5 8H12V13L16.28 15.54L17 14.33L13.5 12.25V8ZM13 3C10.6131 3 8.32387 3.94821 6.63604 5.63604C4.94821 7.32387 4 9.61305 4 12H1L4.96 16.03L9 12H6C6 10.1435 6.7375 8.36301 8.05025 7.05025C9.36301 5.7375 11.1435 5 13 5C14.8565 5 16.637 5.7375 17.9497 7.05025C19.2625 8.36301 20 10.1435 20 12C20 13.8565 19.2625 15.637 17.9497 16.9497C16.637 18.2625 14.8565 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C7.47161 19.2004 8.46234 19.8668 9.55433 20.32C10.6463 20.7733 11.8177 21.0045 13 21C15.3869 21 17.6761 20.0518 19.364 18.364C21.0518 16.6761 22 14.3869 22 12C22 9.61305 21.0518 7.32387 19.364 5.63604C17.6761 3.94821 15.3869 3 13 3Z" fill="black" />
        </svg>

        <span className="small-regular">
          {item.name}
        </span>

        {edit && (
          <div
            ref={clearRef}
            onClick={(e) => { e.stopPropagation(); deleteRecentItem(item.id); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer hover:scale-[1.1]"
          >
            <ClearIcon />
          </div>
        )}

      </div>
    </li>
  )
} 