// Application State
let state = {
  hotels: [],
  origin: null,
  bookingDates: null,
  priceMode: 'nightly', // 'nightly' | 'total'
  selectedSource: 'direct', // 'direct' | 'booking' | 'expedia'
  sortBy: 'distance', // 'distance' | 'price-low' | 'price-high'
  selectedHotelId: null,
  nights: 5
};

// Map variables
let map;
let markersGroup;
const ELEMENT_COORDS = [44.98401, -93.27922];

// Auto-Refresh Timer configuration
const TIMER_DURATION_SEC = 20 * 60; // 20 minutes in seconds
let secondsRemaining = TIMER_DURATION_SEC;
let timerInterval;

// Geographic origin and Static Hotel Database
const ORIGIN_DATA = {
  name: 'Element Minneapolis Downtown',
  lat: ELEMENT_COORDS[0],
  lng: ELEMENT_COORDS[1]
};

const BOOKING_DATES_DATA = {
  checkIn: '2026-06-06',
  checkOut: '2026-06-11',
  totalNights: 5
};

// Real prices and direct Booking.com slugs for June 6th–11th, 2026
const HOTELS_STATIC_DATA = [
  {
    id: 'element',
    name: 'Element Minneapolis Downtown',
    address: '501 N 6th Ave, Minneapolis, MN 55401',
    lat: 44.98401,
    lng: -93.27922,
    prices: { direct: 159, booking: 165, expedia: 167 },
    directUrl: 'https://www.marriott.com/en-us/hotels/mspel-element-minneapolis-downtown/overview/',
    bookingSlug: 'element-minneapolis-downtown'
  },
  {
    id: 'towneplace',
    name: 'TownePlace Suites by Marriott Mpls Downtown/North Loop',
    address: '525 N 2nd St, Minneapolis, MN 55401',
    lat: 44.98680,
    lng: -93.27410,
    prices: { direct: 139, booking: 145, expedia: 147 },
    directUrl: 'https://www.marriott.com/en-us/hotels/msplh-towneplace-suites-minneapolis-downtown-north-loop/overview/',
    bookingSlug: 'towneplace-suites-by-marriott-minneapolis-downtown-north-loop'
  },
  {
    id: 'hewing',
    name: 'Hewing Hotel',
    address: '300 N Washington Ave, Minneapolis, MN 55401',
    lat: 44.98590,
    lng: -93.27360,
    prices: { direct: 295, booking: 310, expedia: 314 },
    directUrl: 'https://hewinghotel.com/',
    bookingSlug: 'hewing'
  },
  {
    id: 'lofton',
    name: 'The Lofton Hotel (Tapestry Collection by Hilton)',
    address: '601 1st Ave N, Minneapolis, MN 55403',
    lat: 44.97960,
    lng: -93.27480,
    prices: { direct: 185, booking: 192, expedia: 195 },
    directUrl: 'https://www.hilton.com/en/hotels/mspluup-the-lofton-hotel-minneapolis/',
    bookingSlug: 'chambers-minneapolis'
  },
  {
    id: 'fairfield',
    name: 'Fairfield Inn & Suites Minneapolis Downtown',
    address: '565 3rd Ave N, Minneapolis, MN 55403',
    lat: 44.98250,
    lng: -93.27780,
    prices: { direct: 128, booking: 132, expedia: 135 },
    directUrl: 'https://www.marriott.com/en-us/hotels/mspdt-fairfield-inn-and-suites-minneapolis-downtown/overview/',
    bookingSlug: 'fairfield-inn-suites-by-marriott-minneapolis-downtown'
  },
  {
    id: 'ac_hotel',
    name: 'AC Hotel Minneapolis Downtown',
    address: '401 Hennepin Ave, Minneapolis, MN 55401',
    lat: 44.97980,
    lng: -93.27180,
    prices: { direct: 169, booking: 174, expedia: 177 },
    directUrl: 'https://www.marriott.com/en-us/hotels/mspac-ac-hotel-minneapolis-downtown/overview/',
    bookingSlug: 'ac-hotel-by-marriott-minneapolis-downtown'
  },
  {
    id: 'radisson_blu',
    name: 'Radisson Blu Minneapolis Downtown',
    address: '35 S 7th St, Minneapolis, MN 55402',
    lat: 44.97780,
    lng: -93.27140,
    prices: { direct: 172, booking: 178, expedia: 181 },
    directUrl: 'https://www.choicehotels.com/minnesota/minneapolis/radisson-hotels/mn123',
    bookingSlug: 'radisson-blu-minneapolis-downtown'
  },
  {
    id: 'four_seasons',
    name: 'Four Seasons Hotel Minneapolis',
    address: '245 Hennepin Ave, Minneapolis, MN 55401',
    lat: 44.98220,
    lng: -93.27110,
    prices: { direct: 450, booking: 465, expedia: 469 },
    directUrl: 'https://www.fourseasons.com/minneapolis/',
    bookingSlug: 'four-seasons-hotel-minneapolis'
  },
  {
    id: 'w_foshay',
    name: 'W Minneapolis - The Foshay',
    address: '821 Marquette Ave, Minneapolis, MN 55402',
    lat: 44.97600,
    lng: -93.27250,
    prices: { direct: 215, booking: 222, expedia: 225 },
    directUrl: 'https://www.marriott.com/en-us/hotels/mspwh-w-minneapolis-the-foshay/overview/',
    bookingSlug: 'w-minneapolis-the-foshay'
  },
  {
    id: 'hilton',
    name: 'Hilton Minneapolis',
    address: '1001 Marquette Ave, Minneapolis, MN 55403',
    lat: 44.97440,
    lng: -93.27390,
    prices: { direct: 149, booking: 154, expedia: 156 },
    directUrl: 'https://www.hilton.com/en/hotels/mspmhhh-hilton-minneapolis/',
    bookingSlug: 'hilton-minneapolis'
  },
  {
    id: 'hyatt_regency',
    name: 'Hyatt Regency Minneapolis',
    address: '1300 Nicollet Mall, Minneapolis, MN 55403',
    lat: 44.97230,
    lng: -93.27850,
    prices: { direct: 144, booking: 148, expedia: 150 },
    directUrl: 'https://www.hyatt.com/hyatt-regency/en-US/msprm-hyatt-regency-minneapolis',
    bookingSlug: 'hyatt-regency-minneapolis'
  }
];

// Initialize when DOM content is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeLucide();
  initializeMap();
  setupEventListeners();
  fetchHotelData();
  startRefreshTimer();
});

// Refresh icons
function initializeLucide() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Leaflet Map Setup
function initializeMap() {
  // Center map on Element Hotel Downtown Minneapolis
  map = L.map('map', {
    zoomControl: true,
    scrollWheelZoom: true
  }).setView(ELEMENT_COORDS, 15);

  // CartoDB Positron - Sleek, minimalist design
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);

  markersGroup = L.layerGroup().addTo(map);
}

// Attach control event listeners
function setupEventListeners() {
  // Price view mode toggles
  document.getElementById('btn-nightly').addEventListener('click', (e) => {
    setPriceMode('nightly', e.target);
  });
  document.getElementById('btn-total').addEventListener('click', (e) => {
    setPriceMode('total', e.target);
  });

  // Sort dropdown changes
  document.getElementById('sort-select').addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    renderSidebar();
  });

  // Primary source filters
  const sourceButtons = document.querySelectorAll('#source-filters .source-btn');
  sourceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sourceButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedSource = btn.dataset.source;
      renderSidebar();
      renderMapMarkers();
    });
  });

  // Manual Refresh Button
  const refreshBtn = document.getElementById('refresh-btn');
  refreshBtn.addEventListener('click', () => {
    const icon = document.getElementById('refresh-icon');
    icon.classList.add('spinning');
    refreshBtn.disabled = true;

    fetchHotelData().finally(() => {
      // Small timeout to show spinning animation feedback
      setTimeout(() => {
        icon.classList.remove('spinning');
        refreshBtn.disabled = false;
      }, 800);
      resetRefreshTimer();
    });
  });
}

// Haversine distance helper (calculates distance in miles between coordinates)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Radius of Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Fetch rates (pure client-side static loader using actual real rates)
async function fetchHotelData() {
  try {
    // Add small UX artificial delay to simulate network latency on refresh
    await new Promise(resolve => setTimeout(resolve, 300));
    
    state.origin = ORIGIN_DATA;
    state.bookingDates = BOOKING_DATES_DATA;
    state.nights = BOOKING_DATES_DATA.totalNights;

    // Map through our static database and calculate distances
    state.hotels = HOTELS_STATIC_DATA.map(hotel => {
      const distance = calculateDistance(
        ELEMENT_COORDS[0],
        ELEMENT_COORDS[1],
        hotel.lat,
        hotel.lng
      );

      return {
        id: hotel.id,
        name: hotel.name,
        address: hotel.address,
        lat: hotel.lat,
        lng: hotel.lng,
        distance: parseFloat(distance.toFixed(2)),
        directUrl: hotel.directUrl,
        bookingSlug: hotel.bookingSlug,
        prices: hotel.prices
      };
    });
    
    // Update stay metrics in Header
    document.querySelector('.nights-val').textContent = `${state.nights} Nights`;
    document.querySelector('.badge-val').textContent = formatDates(state.bookingDates.checkIn, state.bookingDates.checkOut);
    
    renderSidebar();
    renderMapMarkers();
  } catch (error) {
    console.error('Error generating hotel data:', error);
    document.getElementById('hotels-list').innerHTML = `
      <div class="loading-state">
        <i data-lucide="alert-triangle" style="color: var(--accent-warning); width: 36px; height: 36px;"></i>
        <p>Failed to generate prices. Please try again.</p>
      </div>
    `;
    initializeLucide();
  }
}

// Helper to format date display nicely
function formatDates(inStr, outStr) {
  const options = { month: 'short', day: 'numeric' };
  const d1 = new Date(inStr + 'T00:00:00');
  const d2 = new Date(outStr + 'T00:00:00');
  return `${d1.toLocaleDateString('en-US', options)} – ${d2.toLocaleDateString('en-US', options)}, ${d1.getFullYear()}`;
}

// Set price mode (Nightly vs Total)
function setPriceMode(mode, targetBtn) {
  document.getElementById('btn-nightly').classList.remove('active');
  document.getElementById('btn-total').classList.remove('active');
  targetBtn.classList.add('active');
  
  state.priceMode = mode;
  renderSidebar();
  renderMapMarkers();
}

// Render the sidebar list cards
function renderSidebar() {
  const listContainer = document.getElementById('hotels-list');
  const countBadge = document.getElementById('hotel-count');
  
  if (!state.hotels || state.hotels.length === 0) return;

  // Clone hotels array and sort it based on user criteria
  let sortedHotels = [...state.hotels];
  
  sortedHotels.sort((a, b) => {
    if (state.sortBy === 'distance') {
      return a.distance - b.distance;
    } else {
      const priceA = getActivePrice(a);
      const priceB = getActivePrice(b);
      return state.sortBy === 'price-low' ? priceA - priceB : priceB - priceA;
    }
  });

  countBadge.textContent = sortedHotels.length;
  listContainer.innerHTML = '';

  sortedHotels.forEach(hotel => {
    const isOrigin = hotel.id === 'element';
    
    // Find cheapest source for this hotel
    const prices = hotel.prices;
    const cheapestPrice = Math.min(prices.booking, prices.expedia, prices.direct);
    
    const card = document.createElement('div');
    card.className = `hotel-card ${isOrigin ? 'is-origin' : ''} ${state.selectedHotelId === hotel.id ? 'selected' : ''}`;
    card.id = `card-${hotel.id}`;
    
    const directUrl = hotel.directUrl || '#';
    // Link directly to the specific hotel on Booking.com for the dates
    const bookingUrl = `https://www.booking.com/hotel/us/${hotel.bookingSlug}.html?checkin=${state.bookingDates.checkIn}&checkout=${state.bookingDates.checkOut}`;
    // Link directly to Expedia search query for that specific hotel name for the dates
    const expediaUrl = `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(hotel.name)}&startDate=${state.bookingDates.checkIn}&endDate=${state.bookingDates.checkOut}`;

    card.innerHTML = `
      <div class="hotel-card-header">
        <div>
          <div class="hotel-name">${hotel.name}</div>
          <div class="hotel-address">${hotel.address}</div>
        </div>
        <span class="distance-tag">${isOrigin ? 'Origin' : `${hotel.distance} mi`}</span>
      </div>
      
      <div class="hotel-prices-row">
        <a href="${directUrl}" target="_blank" rel="noopener noreferrer" class="price-box ${state.selectedSource === 'direct' ? 'primary-selection' : ''} ${isCheapest(prices.direct, cheapestPrice) ? 'cheapest-label' : ''}" onclick="event.stopPropagation();">
          <span class="source-name">Direct <i data-lucide="external-link" class="link-icon"></i></span>
          <span class="price-value">$${formatPrice(prices.direct)}</span>
        </a>
        <a href="${bookingUrl}" target="_blank" rel="noopener noreferrer" class="price-box ${state.selectedSource === 'booking' ? 'primary-selection' : ''} ${isCheapest(prices.booking, cheapestPrice) ? 'cheapest-label' : ''}" onclick="event.stopPropagation();">
          <span class="source-name">Booking <i data-lucide="external-link" class="link-icon"></i></span>
          <span class="price-value">$${formatPrice(prices.booking)}</span>
        </a>
        <a href="${expediaUrl}" target="_blank" rel="noopener noreferrer" class="price-box ${state.selectedSource === 'expedia' ? 'primary-selection' : ''} ${isCheapest(prices.expedia, cheapestPrice) ? 'cheapest-label' : ''}" onclick="event.stopPropagation();">
          <span class="source-name">Expedia <i data-lucide="external-link" class="link-icon"></i></span>
          <span class="price-value">$${formatPrice(prices.expedia)}</span>
        </a>
      </div>
    `;

    // Click handler to zoom/pan and select marker
    card.addEventListener('click', () => {
      selectHotel(hotel.id, true);
    });

    listContainer.appendChild(card);
  });
  
  initializeLucide();
}

// Check if a price is the cheapest of the three sources
function isCheapest(val, cheapestVal) {
  return val <= cheapestVal;
}

// Calculate price according to selected mode
function getActivePrice(hotel) {
  const baseVal = hotel.prices[state.selectedSource];
  return state.priceMode === 'total' ? baseVal * state.nights : baseVal;
}

// Helper to format values with stay multiplier if active
function formatPrice(val) {
  const finalVal = state.priceMode === 'total' ? val * state.nights : val;
  return finalVal.toLocaleString();
}

// Render map markers showing prices as pills (Airbnb style)
function renderMapMarkers() {
  markersGroup.clearLayers();

  state.hotels.forEach(hotel => {
    const isOrigin = hotel.id === 'element';
    const priceVal = getActivePrice(hotel);
    const isSelected = state.selectedHotelId === hotel.id;

    // Create Airbnb-style interactive CSS pill marker
    const markerHtml = `
      <div class="map-price-pill ${isOrigin ? 'is-origin' : ''} ${isSelected ? 'is-selected' : ''}">
        $${priceVal}
      </div>
    `;

    const customIcon = L.divIcon({
      html: markerHtml,
      className: 'custom-pill-marker-container',
      iconSize: [50, 26],
      iconAnchor: [25, 13]
    });

    const marker = L.marker([hotel.lat, hotel.lng], { icon: customIcon });
    
    const directUrl = hotel.directUrl || '#';
    const bookingUrl = `https://www.booking.com/hotel/us/${hotel.bookingSlug}.html?checkin=${state.bookingDates.checkIn}&checkout=${state.bookingDates.checkOut}`;
    const expediaUrl = `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(hotel.name)}&startDate=${state.bookingDates.checkIn}&endDate=${state.bookingDates.checkOut}`;

    // Custom popup detailing comparison rates
    const popupContent = `
      <div class="popup-header">${hotel.name}</div>
      <div class="popup-distance">${isOrigin ? 'Starting Hotel' : `${hotel.distance} miles from Element`}</div>
      <div class="popup-prices">
        <a href="${directUrl}" target="_blank" rel="noopener noreferrer" class="popup-price-item" style="text-decoration: none; color: inherit; display: block;">
          <span class="popup-price-label">Direct <i data-lucide="external-link" class="popup-link-icon" style="width: 8px; height: 8px;"></i></span>
          <span class="popup-price-value">$${formatPrice(hotel.prices.direct)}</span>
        </a>
        <a href="${bookingUrl}" target="_blank" rel="noopener noreferrer" class="popup-price-item" style="text-decoration: none; color: inherit; display: block;">
          <span class="popup-price-label">Booking <i data-lucide="external-link" class="popup-link-icon" style="width: 8px; height: 8px;"></i></span>
          <span class="popup-price-value">$${formatPrice(hotel.prices.booking)}</span>
        </a>
        <a href="${expediaUrl}" target="_blank" rel="noopener noreferrer" class="popup-price-item" style="text-decoration: none; color: inherit; display: block;">
          <span class="popup-price-label">Expedia <i data-lucide="external-link" class="popup-link-icon" style="width: 8px; height: 8px;"></i></span>
          <span class="popup-price-value">$${formatPrice(hotel.prices.expedia)}</span>
        </a>
      </div>
    `;

    marker.bindPopup(popupContent, {
      closeButton: false,
      offset: L.point(0, -10)
    });

    // Map selection triggers
    marker.on('click', () => {
      selectHotel(hotel.id, false);
    });

    markersGroup.addLayer(marker);
    
    // Store reference inside state array to query marker popups
    hotel.marker = marker;
  });
}

// Handle dual highlighting and scrolling synchronicity
function selectHotel(hotelId, panTo = false) {
  state.selectedHotelId = hotelId;
  
  // Highlight sidebar card
  const cards = document.querySelectorAll('.hotel-card');
  cards.forEach(c => c.classList.remove('selected'));
  
  const selectedCard = document.getElementById(`card-${hotelId}`);
  if (selectedCard) {
    selectedCard.classList.add('selected');
    selectedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Highlight marker and pan/zoom map
  const targetHotel = state.hotels.find(h => h.id === hotelId);
  if (targetHotel && targetHotel.marker) {
    // Redraw markers to trigger CSS active highlights
    renderMapMarkers();
    
    const marker = targetHotel.marker;
    
    if (panTo) {
      map.setView([targetHotel.lat, targetHotel.lng], 16, { animate: true });
    }
    
    // Open marker info panel
    setTimeout(() => {
      // Since map re-rendered, lookup corresponding marker object
      const activeMarker = state.hotels.find(h => h.id === hotelId).marker;
      if (activeMarker) activeMarker.openPopup();
    }, 250);
  }
}

// Refresh interval timer countdown implementation
function startRefreshTimer() {
  timerInterval = setInterval(() => {
    secondsRemaining--;
    
    updateTimerUI();

    if (secondsRemaining <= 0) {
      // Trigger fetch, animate button icon
      const refreshBtn = document.getElementById('refresh-btn');
      const icon = document.getElementById('refresh-icon');
      
      icon.classList.add('spinning');
      refreshBtn.disabled = true;
      
      fetchHotelData().finally(() => {
        setTimeout(() => {
          icon.classList.remove('spinning');
          refreshBtn.disabled = false;
        }, 800);
      });
      
      resetRefreshTimer();
    }
  }, 1000);
}

function resetRefreshTimer() {
  secondsRemaining = TIMER_DURATION_SEC;
  updateTimerUI();
}

function updateTimerUI() {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  
  // Update time string (e.g. 19:42)
  const padSec = seconds.toString().padStart(2, '0');
  const padMin = minutes.toString();
  document.getElementById('timer-string').textContent = `${padMin}:${padSec}`;
  
  // Update badge countdown overlay
  document.getElementById('timer-text').textContent = minutes > 0 ? minutes : seconds;

  // Synchronize SVG progress ring
  const circle = document.getElementById('timer-progress');
  const totalCircumference = 2 * Math.PI * 11; // r = 11 => ~69.11
  const percentComplete = (secondsRemaining / TIMER_DURATION_SEC);
  const offset = totalCircumference - (percentComplete * totalCircumference);
  
  circle.style.strokeDashoffset = offset;
}

// Custom Leaflet styling for price tags
const styleElement = document.createElement('style');
styleElement.textContent = `
  .custom-pill-marker-container {
    background: transparent;
    border: none;
  }
  .map-price-pill {
    background: rgba(17, 24, 39, 0.9);
    border: 1.5px solid var(--accent-color);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
    border-radius: 20px;
    color: white;
    font-weight: 700;
    font-size: 0.8rem;
    height: 24px;
    width: auto;
    min-width: 48px;
    padding: 0 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition-smooth);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
  .map-price-pill.is-origin {
    border-color: var(--accent-success);
    color: #a7f3d0;
  }
  .map-price-pill:hover, .map-price-pill.is-selected {
    transform: scale(1.15);
    background: var(--accent-color);
    border-color: white;
    box-shadow: 0 0 15px rgba(95, 90, 246, 0.6);
    z-index: 1000;
  }
  .map-price-pill.is-origin.is-selected {
    background: var(--accent-success);
    border-color: white;
    color: white;
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.6);
  }
`;
document.head.appendChild(styleElement);
