export interface Testimonial {
  quote: string;
  author: string;
  location: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "An absolute sanctuary. We woke to birdsong, spent lazy afternoons by the pool, and explored Heraklion with ease. The vineyard setting made every evening feel magical.",
    author: "Elena & Marco",
    location: "Milan, Italy",
    rating: 5,
  },
  {
    quote:
      "Perfect for our family of four. The kids loved the pool and garden, while we appreciated the peace and privacy. Truly the best of both worlds — nature and city access.",
    author: "Sarah Mitchell",
    location: "London, UK",
    rating: 5,
  },
  {
    quote:
      "The photos don't do it justice. Immaculate interiors, a stunning outdoor kitchen, and that view over the olive groves at sunset — we'll be back every summer.",
    author: "Thomas & Anna",
    location: "Berlin, Germany",
    rating: 5,
  },
];
