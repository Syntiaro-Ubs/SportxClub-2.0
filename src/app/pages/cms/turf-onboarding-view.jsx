import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Building2, User, Phone, Mail, MapPin,
  CalendarDays, CheckCircle2, XCircle, FileText,
  CreditCard, Search, Eye, AlertTriangle, Shield, Hash
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { turfService } from "../../services/turf.service";

export function TurfOnboardingView() {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Pending");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/onboarding");
      const result = await response.json();
      if (result.success) {
        setRequests(result.data);
      } else {
        setRequests([]);
      }
    } catch (e) {
      console.error(e);
      setRequests([]);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (statusFilter !== "All" && req.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;

    const term = searchTerm.toLowerCase();
    const turfName = req.turf?.name?.toLowerCase() || "";
    const ownerName = req.business?.ownerName?.toLowerCase() || req.personal?.fullName?.toLowerCase() || "";
    return turfName.includes(term) || ownerName.includes(term);
  });

  const handleReview = (req) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };

  const handleAccept = async (req) => {
    if (!window.confirm("Are you sure you want to approve and list this turf?")) return;

    setIsProcessing(true);
    try {
      // Map to the turf schema expected by the platform
      const mappedData = {
        name: req.turf?.name || "New Turf",
        location: req.location?.address || req.location?.city || "Unknown Location",
        sport_type: req.turf?.sports?.[0] || "Football",
        price_per_hour: parseInt(req.pricing?.weekdayPrice) || 1200,
        rating: "5.0",
        reviews: 0,
        status: "Active",
        owner_name: req.business?.ownerName || req.personal?.fullName || "Owner",
        owner_phone: req.business?.phone || "0000000000",
        image_url: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600"
      };

      await turfService.create("admin", mappedData);

      // Update backend status to approved
      await fetch(`http://localhost:5000/api/admin/onboarding/${req.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" })
      });

      const newRequests = requests.map(r => r.id === req.id ? { ...r, status: "Approved" } : r);
      setRequests(newRequests);

      toast.success("Turf onboarding request approved successfully!");
      setIsModalOpen(false);
      setSelectedRequest(null);
    } catch (err) {
      toast.error(err.message || "Failed to approve request");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (req) => {
    if (!window.confirm("Are you sure you want to reject this turf onboarding request?")) return;

    try {
      await fetch(`http://localhost:5000/api/admin/onboarding/${req.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" })
      });

      const newRequests = requests.map(r => r.id === req.id ? { ...r, status: "Rejected" } : r);
      setRequests(newRequests);

      toast.success("Request has been rejected and removed.");
      setIsModalOpen(false);
      setSelectedRequest(null);
    } catch (e) {
      toast.error("Error rejecting request");
    }
  };

  const handleViewDocument = (e, doc) => {
    e.preventDefault();
    if (!doc?.data) return;
    
    const w = window.open("");
    if (!w) {
      alert("Please allow pop-ups to view documents.");
      return;
    }
    
    if (doc.data.startsWith('data:image')) {
      w.document.write(`
        <!DOCTYPE html>
        <html>
          <head><title>${doc.name || 'Document View'}</title></head>
          <body style="margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh; background-color:#1e293b;">
            <img src="${doc.data}" style="max-width:100%; max-height:100vh; object-fit:contain;" />
          </body>
        </html>
      `);
      w.document.close();
    } else if (doc.data.startsWith('data:application/pdf')) {
      w.document.write(`
        <!DOCTYPE html>
        <html>
          <head><title>${doc.name || 'Document View'}</title></head>
          <body style="margin:0;">
            <iframe src="${doc.data}" style="border:none; width:100%; height:100vh;"></iframe>
          </body>
        </html>
      `);
      w.document.close();
    } else {
      w.document.write(`
        <!DOCTYPE html>
        <html>
          <head><title>Unsupported format</title></head>
          <body><p>Unsupported document format.</p></body>
        </html>
      `);
      w.document.close();
    }
  };

  const renderDocumentStatus = (doc) => {
    // If doc is null/undefined or an empty object (from old bug), treat as missing
    if (!doc || (Object.keys(doc).length === 0 && doc.constructor === Object)) {
      return <span className="text-xs font-medium text-rose-500 bg-rose-50 px-2 py-1 rounded-md">Missing</span>;
    }
    
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Uploaded ({doc.name || "File"})
        </div>
        {doc.data && (
          <button onClick={(e) => handleViewDocument(e, doc)} className="p-1 hover:bg-slate-100 rounded-md transition-colors" title="View Document">
            <Eye className="w-4 h-4 text-slate-500" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[#0f172a]">
            Turf Onboarding Requests
          </h2>
          <p className="text-sm text-[#64748b]">
            Review, verify, and approve new turf listings submitted by owners.
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b]" />
          <Input
            placeholder="Search turfs or owners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-white border-[#cbd5e1] focus-visible:ring-emerald-500"
          />
        </div>
      </div>

      <Tabs defaultValue="Pending" value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="mb-6 grid grid-cols-4 w-[400px]">
          <TabsTrigger value="Pending">Pending</TabsTrigger>
          <TabsTrigger value="Approved">Approved</TabsTrigger>
          <TabsTrigger value="Rejected">Rejected</TabsTrigger>
          <TabsTrigger value="All">All</TabsTrigger>
        </TabsList>

        {requests.length === 0 ? (
          <div className="bg-white border border-[#e2e8f0] rounded-3xl p-12 text-center shadow-xs flex flex-col items-center">
            <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-[#0f172a]">All Caught Up!</h3>
            <p className="text-sm text-[#64748b] mt-1">There are no pending turf onboarding requests at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
            {filteredRequests.map(req => (
              <Card key={req.id} className="border-[#e2e8f0] shadow-xs hover:shadow-sm transition-shadow rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-transparent p-3 pb-2 border-b border-[#f1f5f9]">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-base font-bold text-[#0f172a]">{req.business?.businessName || req.turf?.name || "Unnamed Turf"}</CardTitle>
                      <CardDescription className="flex items-center gap-1.5 mt-1 text-xs font-medium text-[#475569]">
                        <MapPin className="w-3 h-3" />
                        {req.location?.city || "Unknown City"}{req.location?.state ? `, ${req.location.state}` : ""}
                      </CardDescription>
                    </div>
                    <Badge className={`border-0 rounded-full px-2.5 py-0.5 font-semibold text-[10px] whitespace-nowrap ${req.status?.toLowerCase() === 'approved' || req.status?.toLowerCase() === 'active' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
                        req.status?.toLowerCase() === 'rejected' ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' :
                          'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      }`}>
                      {req.status?.toLowerCase() === 'approved' || req.status?.toLowerCase() === 'active' ? 'Approved' : req.status || 'Pending'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-2 pb-2">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Owner Name</span>
                        <p className="text-sm font-semibold text-[#1e293b] truncate flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-emerald-500" />
                          {req.business?.ownerName || req.personal?.fullName}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Contact</span>
                        <p className="text-sm font-semibold text-[#1e293b] truncate flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-500" />
                          {req.business?.phone || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-0.5 col-span-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Email (Registration)</span>
                        <p className="text-sm font-semibold text-[#1e293b] truncate flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          {req.ownerEmail || req.business?.email || req.personal?.email || "N/A"}
                        </p>
                      </div>
                      <div className="space-y-0.5 col-span-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Turf Owner ID</span>
                        <p className="text-sm font-semibold text-[#1e293b] truncate flex items-center gap-1.5 font-mono">
                          <Hash className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          {req.ownerId || "PENDING"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#f1f5f9]">
                      <span className="text-[10px] text-[#64748b] flex items-center gap-1.5 font-medium">
                        <CalendarDays className="w-3 h-3" />
                        Submitted: {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                      <Button
                        onClick={() => handleReview(req)}
                        className="bg-[#0f172a] text-white hover:bg-[#1e293b] rounded-lg h-8 px-3 text-[10px] font-bold"
                      >
                        <Eye className="w-3 h-3 mr-1.5" />
                        Review Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Tabs>

      {/* Request Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-[32px] gap-0">
          {selectedRequest && (
            <>
              <div className="bg-gradient-to-r from-emerald-50 to-white px-8 py-6 border-b border-[#e2e8f0] flex items-start justify-between shrink-0">
                <div>
                  <DialogTitle className="text-2xl font-black text-[#0f172a] flex items-center gap-2">
                    {selectedRequest.turf?.name}
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 rounded-full px-2 py-0.5 text-[10px]">Pending</Badge>
                  </DialogTitle>
                  <p className="text-sm font-medium text-[#64748b] mt-1.5 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {selectedRequest.location?.address}, {selectedRequest.location?.city}
                  </p>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 p-8 bg-[#f8fafc]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Business & Owner Info */}
                    <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-sm">
                      <h3 className="text-sm font-black uppercase tracking-wider text-[#0f172a] mb-4 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-500" />
                        Business & Owner
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#64748b] font-medium">Business Name:</span>
                          <span className="font-bold text-[#0f172a] text-right">{selectedRequest.business?.businessName || "-"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#64748b] font-medium">Owner Name:</span>
                          <span className="font-bold text-[#0f172a] text-right">{selectedRequest.business?.ownerName || selectedRequest.personal?.fullName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#64748b] font-medium">Phone:</span>
                          <span className="font-bold text-[#0f172a] text-right">{selectedRequest.business?.phone || "-"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#64748b] font-medium">GST:</span>
                          <span className="font-bold text-[#0f172a] text-right">{selectedRequest.business?.gst || "Not Provided"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Turf Details */}
                    <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-sm">
                      <h3 className="text-sm font-black uppercase tracking-wider text-[#0f172a] mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        Turf Specifics
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#64748b] font-medium">Sports:</span>
                          <span className="font-bold text-[#0f172a] text-right">{selectedRequest.turf?.sports?.join(", ") || "-"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#64748b] font-medium">Grounds:</span>
                          <span className="font-bold text-[#0f172a] text-right">{selectedRequest.turf?.groundCount || "-"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#64748b] font-medium">Size:</span>
                          <span className="font-bold text-[#0f172a] text-right">{selectedRequest.turf?.groundSize || "-"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#64748b] font-medium">Surface:</span>
                          <span className="font-bold text-[#0f172a] text-right">{selectedRequest.turf?.surfaceType || "-"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-sm">
                      <h3 className="text-sm font-black uppercase tracking-wider text-[#0f172a] mb-4 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-500" />
                        Pricing & Timings
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#64748b] font-medium">Timings:</span>
                          <span className="font-bold text-[#0f172a] text-right">{selectedRequest.pricing?.openingTime} - {selectedRequest.pricing?.closingTime}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#64748b] font-medium">Weekday Price:</span>
                          <span className="font-bold text-[#0f172a] text-right">₹{selectedRequest.pricing?.weekdayPrice}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#64748b] font-medium">Weekend Price:</span>
                          <span className="font-bold text-[#0f172a] text-right">₹{selectedRequest.pricing?.weekendPrice}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (Documents) */}
                  <div className="space-y-6">
                    <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-sm h-full">
                      <h3 className="text-sm font-black uppercase tracking-wider text-[#0f172a] mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-500" />
                        Verification Documents
                      </h3>
                      <div className="space-y-4">
                        <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] flex justify-between items-center">
                          <span className="text-sm font-bold text-[#334155]">Aadhaar Front</span>
                          {renderDocumentStatus(selectedRequest.identity?.aadhaarFront)}
                        </div>
                        <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] flex justify-between items-center">
                          <span className="text-sm font-bold text-[#334155]">Aadhaar Back</span>
                          {renderDocumentStatus(selectedRequest.identity?.aadhaarBack)}
                        </div>
                        <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] flex justify-between items-center">
                          <span className="text-sm font-bold text-[#334155]">PAN Card</span>
                          {renderDocumentStatus(selectedRequest.identity?.panCard)}
                        </div>
                        <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] flex justify-between items-center">
                          <span className="text-sm font-bold text-[#334155]">Electric Bill</span>
                          {renderDocumentStatus(selectedRequest.identity?.electricBill)}
                        </div>
                        <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] flex justify-between items-center">
                          <span className="text-sm font-bold text-[#334155]">Trade License</span>
                          {renderDocumentStatus(selectedRequest.business?.tradeLicense)}
                        </div>
                        <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] flex justify-between items-center">
                          <span className="text-sm font-bold text-[#334155]">Cancelled Cheque</span>
                          {renderDocumentStatus(selectedRequest.bank?.cancelledCheque)}
                        </div>
                      </div>

                      <div className="mt-6 bg-amber-50 p-4 rounded-xl border border-amber-200 flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-800 font-medium leading-relaxed">
                          Please verify all documents match the provided business and personal details before approving this turf.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 py-5 border-t border-[#e2e8f0] bg-white flex justify-end gap-3 shrink-0">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl font-bold h-11 px-6 border-[#cbd5e1] text-[#475569] hover:bg-[#f1f5f9]"
                >
                  {selectedRequest.status?.toLowerCase() === 'pending' ? 'Cancel' : 'Close'}
                </Button>
                {selectedRequest.status?.toLowerCase() === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleReject(selectedRequest)}
                      disabled={isProcessing}
                      variant="destructive"
                      className="rounded-xl font-bold h-11 px-6 bg-rose-600 hover:bg-rose-700"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Request
                    </Button>
                    <Button
                      onClick={() => handleAccept(selectedRequest)}
                      disabled={isProcessing}
                      className="rounded-xl font-bold h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {isProcessing ? "Processing..." : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Approve & List Turf
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
