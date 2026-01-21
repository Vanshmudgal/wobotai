import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, MapPin, ChevronDown, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  CircleOff, CheckCircle2, Wifi
} from 'lucide-react';

import brand from "./brand.svg";

function Hello() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); 
  const [locationFilter, setLocationFilter] = useState("All"); 
  const [currentPage, setCurrentPage] = useState(1);
  
  // itemsPerPage state sirf 10 aur 20 handle karega
  const [itemsPerPage, setItemsPerPage] = useState(10); 

  const TOKEN = import.meta.env.VITE_APITOKEN;
  const BASE_URL = import.meta.env.VITE_URL;

  const fetchCameras = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/fetch/cameras`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      const rawCameras = res.data.data?.cameras || [];
      const mappedData = rawCameras.map((cam) => ({
        id: cam.id, 
        name: cam.name,
        location: cam.location,
        status: cam.status?.toLowerCase() === 'active' ? 'Active' : 'Inactive', 
        ip_address: cam.ip_address,
        model: cam.model,
        resolution: cam.resolution
      }));
      setData(mappedData);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCameras(); }, []);

  const toggleStatus = async (id, currentStatus) => {
    const newStatusPayload = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      await axios.post(`${BASE_URL}/update/camera/status`, 
        { id: id, status: newStatusPayload },
        { headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" } }
      );
      setData(prev => prev.map(cam => cam.id === id ? { ...cam, status: newStatusPayload } : cam));
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleFilterChange = (type, value) => {
    if (type === 'location') setLocationFilter(value);
    if (type === 'status') setStatusFilter(value);
    if (type === 'search') setSearchTerm(value);
    setCurrentPage(1); 
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); 
  };

  const filteredCameras = data.filter((cam) => {
    const matchesSearch = cam.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || cam.status === statusFilter;
    const matchesLocation = locationFilter === "All" || cam.location === locationFilter;
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const totalItems = filteredCameras.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCameras.slice(indexOfFirstItem, indexOfLastItem);
  const uniqueLocations = [...new Set(data.map(c => c.location))];

  if (loading) return <div className="flex justify-center items-center h-screen font-sans text-gray-400 bg-[#F9FAFB]">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-[#374151]">
      <div className="flex justify-center py-6">
        <img src={brand} alt="Wobot.ai" className="h-8" />
      </div>

      <div className="max-w-[1400px] mx-auto px-10 pb-10">
        <div className="flex justify-between items-start mb-8">
          <div className="text-left flex flex-col">
            <h1 className="text-[28px] font-semibold text-[#111827] leading-none m-0 p-0">Cameras</h1>
            <p className="text-[14px] text-[#6B7280] mt-2 p-0">Manage your cameras here.</p>
          </div>

          <div className="relative">
            <input 
              type="text" 
              placeholder="search" 
              className="w-72 pl-4 pr-10 py-2.5 bg-[#F3F4F6] border border-gray-200 rounded-md text-[14px] outline-none transition-all focus:ring-1 focus:ring-blue-300"
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative">
            <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3.5 pointer-events-none" />
            <select 
              className="appearance-none pl-9 pr-10 py-2.5 bg-white border border-gray-200 rounded-md text-[14px] text-gray-500 outline-none cursor-pointer shadow-sm"
              onChange={(e) => handleFilterChange('location', e.target.value)}
            >
              <option value="All">Location</option>
              {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
          </div>

          <div className="relative">
            <Wifi className="w-4 h-4 text-gray-400 absolute left-3 top-3.5 pointer-events-none rotate-45" />
            <select 
              className="appearance-none pl-9 pr-10 py-2.5 bg-white border border-gray-200 rounded-md text-[14px] text-gray-500 outline-none cursor-pointer shadow-sm"
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="All">Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white">
              <tr className="border-b border-gray-100">
                <th className="py-4 px-6 w-12 text-center"><input type="checkbox" className="w-4 h-4 rounded border-gray-300" /></th>
                <th className="py-4 px-4 text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider">Name</th>
                <th className="py-4 px-4 text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider">Model</th>
                <th className="py-4 px-4 text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider">Location</th>
                <th className="py-4 px-4 text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider">Recorder</th>
                <th className="py-4 px-4 text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider">Tasks</th>
                <th className="py-4 px-4 text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider text-center">Status</th>
                <th className="py-4 px-4 text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider text-right pr-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentItems.map((cam) => (
                <tr key={cam.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-5 px-6 text-center"><input type="checkbox" className="w-4 h-4 rounded border-gray-300" /></td>
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${cam.status === 'Active' ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}></div>
                      <div>
                        <span className="text-[14px] font-medium text-[#111827]">{cam.name}</span>
                        <div className="text-[12px] text-gray-400">admin@wobot.ai</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-4 text-[14px] text-gray-500">{cam.model}</td>
                  <td className="py-5 px-4 text-[14px] text-gray-600">{cam.location}</td>
                  <td className="py-5 px-4 text-[14px] text-gray-600">{cam.ip_address}</td>
                  <td className="py-5 px-4 text-[14px] text-gray-600">{cam.resolution}</td>
                  <td className="py-5 px-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-md text-[12px] font-semibold ${
                      cam.status === 'Active' ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#F3F4F6] text-[#6B7280]'
                    }`}>
                      {cam.status}
                    </span>
                  </td>
                  <td className="py-5 px-4 text-right pr-10">
                    <button onClick={() => toggleStatus(cam.id, cam.status)} className="text-gray-400 hover:text-gray-700">
                      {cam.status === 'Active' ? <CircleOff className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Footer - UPDATED OPTIONS */}
          <div className="flex justify-end items-center py-4 px-10 border-t border-gray-100 gap-8 text-[14px] text-gray-500 bg-white">
            <div className="flex items-center gap-2 relative">
              <select 
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="appearance-none bg-transparent border-none outline-none cursor-pointer text-gray-600 font-medium pr-4"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-0 pointer-events-none" />
            </div>

            <span className="font-medium">
              {totalItems > 0 ? `${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, totalItems)}` : '0-0'} of {totalItems}
            </span>

            <div className="flex gap-4 items-center">
              <ChevronsLeft onClick={() => setCurrentPage(1)} className={`w-5 h-5 ${currentPage === 1 ? 'opacity-20 cursor-default' : 'opacity-100 cursor-pointer hover:text-gray-800'}`} />
              <ChevronLeft onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className={`w-5 h-5 ${currentPage === 1 ? 'opacity-20 cursor-default' : 'opacity-100 cursor-pointer hover:text-gray-800'}`} />
              <ChevronRight onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} className={`w-5 h-5 ${currentPage === totalPages || totalPages === 0 ? 'opacity-20 cursor-default' : 'opacity-100 cursor-pointer hover:text-gray-800'}`} />
              <ChevronsRight onClick={() => setCurrentPage(totalPages)} className={`w-5 h-5 ${currentPage === totalPages || totalPages === 0 ? 'opacity-20 cursor-default' : 'opacity-100 cursor-pointer hover:text-gray-800'}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hello;