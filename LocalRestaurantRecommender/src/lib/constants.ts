// DMV neighborhoods for location matching
export const DMV_NEIGHBORHOODS = [
  // DC
  "Georgetown", "Dupont Circle", "Adams Morgan", "Capitol Hill",
  "Navy Yard", "U Street", "H Street", "Penn Quarter", "Chinatown",
  "Logan Circle", "Shaw", "Columbia Heights", "Foggy Bottom",
  "Cleveland Park", "Woodley Park", "Tenleytown", "Glover Park",
  "Brookland", "Petworth", "Wharf", "Union Market", "NoMa",
  // Virginia
  "Arlington", "Clarendon", "Ballston", "Rosslyn", "Old Town Alexandria",
  "Tysons", "Falls Church", "Annandale", "Fairfax", "Reston",
  "Herndon", "McLean", "Vienna", "Merrifield", "Eden Center",
  "Centreville", "Chantilly", "Ashburn", "Sterling",
  // Maryland
  "Bethesda", "Silver Spring", "Rockville", "College Park",
  "Wheaton", "Gaithersburg", "Bowie", "Greenbelt", "Hyattsville",
  "Takoma Park", "Kensington", "Pikesville", "Columbia",
];

export const CUISINE_TYPES = [
  "Korean", "Chinese", "Japanese", "Vietnamese", "Thai", "Indian",
  "Italian", "French", "Mexican", "Mediterranean", "American",
  "Ethiopian", "Peruvian", "Salvadoran", "Sushi", "Ramen",
  "Hot Pot", "BBQ", "Seafood", "Brunch", "Dim Sum", "Pho",
  "Pizza", "Steakhouse", "Tapas", "Bakery", "Cafe", "Dessert",
];

export const VIBE_TAGS = [
  "trendy", "cozy", "romantic", "casual", "upscale", "lively",
  "quiet", "photogenic", "family-friendly", "date-night",
  "girls-dinner", "outdoor-seating", "rooftop", "hidden-gem",
  "late-night", "happy-hour", "brunch-spot", "instagrammable",
];

export const EXAMPLE_PROMPTS = [
  "Find a cute brunch spot in Georgetown for 3 under $$",
  "Girls dinner in DC this Friday, trendy but not too loud",
  "Best Korean food near Annandale for 5 with easy parking",
  "Romantic Italian restaurant in Old Town Alexandria for date night",
  "Fun group dinner spot in Navy Yard, good for 8 people",
  "Cozy ramen place in Bethesda, open late",
];

// Ranking weights
export const RANKING_WEIGHTS = {
  queryMatch: 0.20,
  vibeMatch: 0.15,
  cuisineMatch: 0.15,
  locationFit: 0.10,
  budgetFit: 0.10,
  reviewQuality: 0.10,
  reviewVolume: 0.05,
  xhsPopularity: 0.10,
  reservationFriendliness: 0.05,
};

// DMV center for Google Places location bias
export const DMV_CENTER = {
  latitude: 38.9072,
  longitude: -77.0369,
  radiusMeters: 50000,
};
