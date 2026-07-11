// Mock API to simulate backend for Turf Owner Dashboard
const originalFetch = window.fetch;

window.fetch = async (input, init) => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;

  // Add a small delay to simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (url.includes("/api/owner/disabled-dates")) {
    const urlObj = new URL(url.startsWith("http") ? url : `http://localhost${url}`);
    const ownerId = urlObj.searchParams.get("ownerId");
    
    let dates = JSON.parse(localStorage.getItem("mock_disabled_dates") || "[]");

    if (init?.method === "POST") {
      const { date, ownerId } = JSON.parse(init.body);
      if (!dates.some(d => d.date === date && d.ownerId === ownerId)) {
        dates.push({ date, ownerId });
        localStorage.setItem("mock_disabled_dates", JSON.stringify(dates));
      }
      return new Response(JSON.stringify({ success: true }), { status: 201 });
    }

    if (init?.method === "DELETE") {
      const { date, ownerId } = JSON.parse(init.body);
      dates = dates.filter(d => !(d.date === date && d.ownerId === ownerId));
      localStorage.setItem("mock_disabled_dates", JSON.stringify(dates));
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    if (ownerId) {
      dates = dates.filter((d) => d.ownerId === ownerId);
    }
    
    return new Response(JSON.stringify(dates), { status: 200 });
  }

  if (url.includes("/api/owner/analytics")) {
    return new Response(
      JSON.stringify({
        stats: {
          totalTurfs: 4,
          activeTurfs: 3,
          monthlyRevenue: 125000,
          pendingPayments: 15000,
          todaysBookings: 12,
          upcomingBookings: 45,
          reviewsCount: 128,
          averageRating: 4.8,
        },
        recentActivity: {
          bookings: [
            {
              title: "Booking Confirmed",
              description: "Rahul booked Premium Green Turf for 2 hours",
              time: "10:00 AM",
            },
            {
              title: "Payment Received",
              description: "Received ₹3000 from Anjali for Skyline Arena",
              time: "11:30 AM",
            },
            {
              title: "New Review",
              description: "5-star review left by Vikram for Community Pitch",
              time: "02:15 PM",
            },
          ],
          cancellations: [],
        },
        charts: {
          revenue: [
            { month: "Jan", amount: 80000 },
            { month: "Feb", amount: 95000 },
            { month: "Mar", amount: 110000 },
            { month: "Apr", amount: 125000 },
            { month: "May", amount: 140000 },
            { month: "Jun", amount: 155000 },
          ],
          bookingTrend: [
            { date: "Mon", count: 12 },
            { date: "Tue", count: 18 },
            { date: "Wed", count: 22 },
            { date: "Thu", count: 20 },
            { date: "Fri", count: 35 },
            { date: "Sat", count: 45 },
            { date: "Sun", count: 40 },
          ],
        },
      }),
      { status: 200 },
    );
  }

  if (url.includes("/api/owner/turf")) {
    const urlObj = new URL(url.startsWith("http") ? url : `http://localhost${url}`);
    const ownerId = urlObj.searchParams.get("ownerId");
    
    let turfs = JSON.parse(localStorage.getItem("mock_turfs") || "null");
    
    if (!turfs) {
      turfs = [
        {
          id: "1",
          ownerId: "owner-123",
          name: "Premium Green Turf",
          location: "Downtown Sports Complex",
          price: 1500,
          status: "Active",
          rating: 4.8,
          sportType: "Football",
          image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop",
        },
        {
          id: "2",
          ownerId: "owner-123",
          name: "Skyline Arena",
          location: "Uptown Tech Park",
          price: 2000,
          status: "Active",
          rating: 4.9,
          sportType: "Cricket",
          image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=600&auto=format&fit=crop",
        },
        {
          id: "3",
          ownerId: "owner-123",
          name: "Community Pitch",
          location: "Suburbs Recreation Center",
          price: 800,
          status: "Maintenance",
          rating: 4.2,
          sportType: "Badminton",
          image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600&auto=format&fit=crop",
        },
        {
          id: "4",
          ownerId: "owner-123",
          name: "Neon Box",
          location: "City Center Mall",
          price: 2500,
          status: "Active",
          rating: 4.7,
          sportType: "Box Cricket",
          image: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=600&auto=format&fit=crop",
        },
        {
          id: "5",
          ownerId: "owner-123",
          name: "Olympus Tennis Court",
          location: "Westside Avenue",
          price: 1200,
          status: "Active",
          rating: 4.6,
          sportType: "Tennis",
          image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=600&auto=format&fit=crop",
        },
        {
          id: "6",
          ownerId: "owner-123",
          name: "Titan Basketball Gym",
          location: "East End Campus",
          price: 1800,
          status: "Active",
          rating: 4.9,
          sportType: "Basketball",
          image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=600&auto=format&fit=crop",
        },
      ];
      localStorage.setItem("mock_turfs", JSON.stringify(turfs));
    }

    if (init?.method === "POST") {
      const newTurf = JSON.parse(init.body);
      newTurf.id = Date.now().toString();
      turfs.push(newTurf);
      localStorage.setItem("mock_turfs", JSON.stringify(turfs));
      return new Response(JSON.stringify(newTurf), { status: 201 });
    }

    if (init?.method === "PUT") {
      const turfId = url.split('/').pop().split('?')[0];
      const updateData = JSON.parse(init.body);
      turfs = turfs.map(t => t.id === turfId ? { ...t, ...updateData } : t);
      localStorage.setItem("mock_turfs", JSON.stringify(turfs));
      return new Response(JSON.stringify(updateData), { status: 200 });
    }
    
    if (init?.method === "DELETE") {
      const turfId = url.split('/').pop().split('?')[0];
      turfs = turfs.filter(t => t.id !== turfId);
      localStorage.setItem("mock_turfs", JSON.stringify(turfs));
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    if (ownerId) {
      turfs = turfs.filter((t) => t.ownerId === ownerId);
    }
    
    return new Response(JSON.stringify(turfs), { status: 200 });
  }

  if (url.includes("/api/owner/booking")) {
    return new Response(
      JSON.stringify([
        {
          id: "b1",
          turfName: "Premium Green Turf",
          sportType: "Football",
          customerName: "Rahul Sharma",
          customerPhone: "+91 9876543210",
          date: "2023-10-25",
          time: "18:00",
          duration: 2,
          status: "Confirmed",
          amount: 3000,
          paymentStatus: "Paid",
        },
        {
          id: "b2",
          turfName: "Skyline Arena",
          sportType: "Cricket",
          customerName: "Anjali Desai",
          customerPhone: "+91 9876543211",
          date: "2023-10-25",
          time: "19:00",
          duration: 1,
          status: "Pending",
          amount: 2000,
          paymentStatus: "Unpaid",
        },
        {
          id: "b3",
          turfName: "Neon Box",
          sportType: "Box Cricket",
          customerName: "Vikram Singh",
          customerPhone: "+91 9876543212",
          date: "2023-10-26",
          time: "20:00",
          duration: 3,
          status: "Completed",
          amount: 7500,
          paymentStatus: "Paid",
        },
      ]),
      { status: 200 },
    );
  }

  if (url.includes("/api/owner/customer")) {
    return new Response(
      JSON.stringify([
        {
          id: "c1",
          name: "Rahul Sharma",
          email: "rahul@example.com",
          phone: "+91 9876543210",
          totalBookings: 15,
          totalSpent: 45000,
          lastBooking: "2023-10-25",
        },
        {
          id: "c2",
          name: "Anjali Desai",
          email: "anjali@example.com",
          phone: "+91 9876543211",
          totalBookings: 8,
          totalSpent: 16000,
          lastBooking: "2023-10-25",
        },
        {
          id: "c3",
          name: "Vikram Singh",
          email: "vikram@example.com",
          phone: "+91 9876543212",
          totalBookings: 12,
          totalSpent: 30000,
          lastBooking: "2023-10-26",
        },
      ]),
      { status: 200 },
    );
  }

  if (url.includes("/api/owner/review")) {
    return new Response(
      JSON.stringify([
        {
          id: "r1",
          customerName: "Rahul Sharma",
          turfName: "Premium Green Turf",
          rating: 5,
          comment: "Amazing turf quality, loved playing here.",
          date: "2023-10-20",
        },
        {
          id: "r2",
          customerName: "Anjali Desai",
          turfName: "Skyline Arena",
          rating: 4,
          comment: "Good lighting but could improve the changing rooms.",
          date: "2023-10-22",
        },
      ]),
      { status: 200 },
    );
  }
  if (url.includes("/api/owner/notification")) {
    return new Response(
      JSON.stringify([
        {
          id: "n1",
          title: "New Booking Request",
          message: "Rahul requested to book Premium Green",
          read: false,
          date: "2023-10-24T10:00:00Z",
          type: "booking",
        },
        {
          id: "n2",
          title: "Payment Successful",
          message: "₹7500 credited to your account",
          read: true,
          date: "2023-10-23T14:30:00Z",
          type: "payment",
        },
      ]),
      { status: 200 },
    );
  }
  if (url.includes("/api/owner/promotion")) {
    return new Response(
      JSON.stringify([
        {
          id: "p1",
          code: "WEEKEND20",
          discount: 20,
          type: "percentage",
          validUntil: "2024-06-30",
          status: "active",
          usageLimit: 100,
          used: 45,
        },
        {
          id: "p2",
          code: "FLAT500",
          discount: 500,
          type: "fixed",
          validUntil: "2024-12-31",
          status: "active",
          usageLimit: 50,
          used: 12,
        },
      ]),
      { status: 200 },
    );
  }

  if (url.includes("/api/owner/revenue")) {
    return new Response(
      JSON.stringify([
        {
          id: "tx1",
          date: "2023-10-01",
          amount: 15000,
          source: "Premium Green Turf",
          status: "completed",
        },
        {
          id: "tx2",
          date: "2023-10-02",
          amount: 24000,
          source: "Skyline Arena",
          status: "completed",
        },
        {
          id: "tx3",
          date: "2023-10-03",
          amount: 8000,
          source: "Community Pitch",
          status: "pending",
        },
      ]),
      { status: 200 },
    );
  }

  if (url.includes("/api/owner/document")) {
    return new Response(
      JSON.stringify([
        {
          id: "d1",
          name: "Turf Ownership Deed.pdf",
          type: "PDF",
          size: "2.5 MB",
          uploadDate: "2023-01-15",
          status: "verified",
        },
        {
          id: "d2",
          name: "Municipal Clearance 2023.pdf",
          type: "PDF",
          size: "1.2 MB",
          uploadDate: "2023-04-10",
          status: "verified",
        },
        {
          id: "d3",
          name: "Business License.jpg",
          type: "Image",
          size: "800 KB",
          uploadDate: "2023-08-05",
          status: "pending",
        },
      ]),
      { status: 200 },
    );
  }
  if (url.includes("/api/owner/setting")) {
    return new Response(
      JSON.stringify({
        businessName: "Elite Sports Management",
        contactEmail: "owner@elitesports.com",
        contactPhone: "+91 9800000000",
        notifications: true,
        emailAlerts: true,
        smsAlerts: false,
        theme: "system",
        currency: "INR",
      }),
      { status: 200 },
    );
  }

  // Fallback for any other API owner endpoints
  if (url.includes("/api/owner")) {
    return new Response(JSON.stringify([]), { status: 200 });
  }

  return originalFetch(input, init);
};
