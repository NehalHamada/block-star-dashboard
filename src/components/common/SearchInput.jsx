import { memo } from "react";
import { Search } from "lucide-react";

/**
 * SearchInput — search field with a search icon on the right
 *
 * Usage:
 *   <SearchInput
 *     value={search}
 *     onChange={(e) => setSearch(e.target.value)}
 *     placeholder="بحث..."
 *   />
 */
const SearchInput = memo(({ value, onChange, placeholder = "بحث...", className = "" }) => (
  <div className={`relative flex-1 min-w-[200px] ${className}`}>
    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="text-black w-full pr-9 pl-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
    />
  </div>
));

SearchInput.displayName = "SearchInput";
export default SearchInput;
