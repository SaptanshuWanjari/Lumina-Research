import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Search } from "lucide-react";
const Searchbar = () => {
  return (
    <div className="w-full ">
      <div className="relative flex items-center w-full">
        <Search
          size={22}
          className="absolute left-4 text-gray-400"
        />

        <Input
          type="search"
          placeholder="Search..."
          className="pl-10 pr-28 py-6 rounded-full bg-white border-none focus-visible:ring-0"
        />

        <Button className="absolute right-2 rounded-full px-4 py-2 bg-black text-white hover:bg-black/90">
          Analyze
        </Button>
      </div>
    </div>
  );
};

export default Searchbar;
