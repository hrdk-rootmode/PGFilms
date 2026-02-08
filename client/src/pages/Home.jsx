import React, { useContext, useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { 
  ArrowDown, 
  Camera, 
  Film, 
  Heart, 
  Star, 
  Users, 
  Award,
  Instagram,
  Youtube,
  Facebook,
  Phone,
  Mail,
  MapPin,
  ChevronRight
} from 'lucide-react'
import { PerformanceContext } from '../App'
import Background3D from '../components/Background3D'
import Portfolio from '../components/Portfolio'
import ChatWidget from '../components/ChatWidget'

// ═══════════════════════════════════════════════════════════════
// ANIMATED SECTION WRAPPER
// ═══════════════════════════════════════════════════════════════

const AnimatedSection = ({ children, className = '', id = '' }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const { enableAnimations } = useContext(PerformanceContext)

  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: enableAnimations ? 50 : 0 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: enableAnimations ? 0.6 : 0 }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

// ═══════════════════════════════════════════════════════════════
// NAVBAR
// ═══════════════════════════════════════════════════════════════

const Navbar = () => {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const filmmakerName = import.meta.env.VITE_FILMMAKER_NAME || 'PG Films'

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? 'glass py-3' : 'py-6'
      }`}
    >
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <motion.a 
          href="#"
          whileHover={{ scale: 1.05 }}
          className="text-2xl font-display font-bold gradient-text"
        >
          {filmmakerName}
        </motion.a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {['Portfolio', 'Packages', 'About', 'Contact'].map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item.toLowerCase())}
              className="text-gray-300 hover:text-white transition-colors relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all group-hover:w-full" />
            </button>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToSection('contact')}
            className="btn-primary text-sm"
          >
            Book Now
          </motion.button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5">
          <span className="w-6 h-0.5 bg-white rounded-full" />
          <span className="w-6 h-0.5 bg-white rounded-full" />
          <span className="w-4 h-0.5 bg-white rounded-full ml-auto" />
        </button>
      </div>
    </motion.nav>
  )
}

// ═══════════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════════

const HeroSection = () => {
  const { scrollY } = useScroll()
  const { enableAnimations } = useContext(PerformanceContext)
  
  const y = useTransform(scrollY, [0, 500], [0, enableAnimations ? 150 : 0])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  
  const filmmakerName = import.meta.env.VITE_FILMMAKER_NAME || 'PG Films'
  const tagline = import.meta.env.VITE_FILMMAKER_TAGLINE || 'Capturing Moments, Creating Memories'

  const scrollToPortfolio = () => {
    document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Content */}
      <motion.div 
        style={{ y, opacity }}
        className="relative z-10 text-center px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 text-sm mb-6">
            ✨ Professional Photography & Filmmaking
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="heading-xl mb-6"
        >
          <span className="gradient-text">{filmmakerName}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto"
        >
          {tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToPortfolio}
            className="btn-primary"
          >
            <Camera size={18} className="mr-2" />
            View My Work
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-secondary"
          >
            <Film size={18} className="mr-2" />
            View Packages
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.button
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          onClick={scrollToPortfolio}
          className="flex flex-col items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <span className="text-sm">Scroll to explore</span>
          <ArrowDown size={20} />
        </motion.button>
      </motion.div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// PORTFOLIO SECTION
// ═══════════════════════════════════════════════════════════════

const PortfolioSection = () => {
  return (
    <AnimatedSection id="portfolio" className="section-padding">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary-400 text-sm font-medium uppercase tracking-wider">Portfolio</span>
          <h2 className="heading-lg mt-2 mb-4">My Recent Work</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Every photograph tells a unique story. Here's a glimpse into the moments I've captured.
          </p>
        </div>

        {/* Portfolio Grid */}
        <Portfolio />

        {/* Instagram CTA */}
        <div className="text-center mt-12">
          <motion.a
            href={import.meta.env.VITE_INSTAGRAM_URL || '#'}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
          >
            <Instagram size={20} />
            Follow on Instagram for more
            <ChevronRight size={16} />
          </motion.a>
        </div>
      </div>
    </AnimatedSection>
  )
}

// ═══════════════════════════════════════════════════════════════
// PACKAGES SECTION
// ═══════════════════════════════════════════════════════════════

const packages = [
  {
    id: 'wedding-gold',
    name: 'Wedding Gold',
    price: '₹75,000',
    popular: true,
    emoji: '💍',
    features: [
      'Full day coverage (10 hours)',
      '500+ edited photos',
      'Cinematic highlight video',
      '2 professional photographers',
      'Pre-wedding consultation',
      'Online gallery delivery'
    ]
  },
  {
    id: 'portrait',
    name: 'Portrait Session',
    price: '₹25,000',
    popular: false,
    emoji: '📸',
    features: [
      '2-3 hours session',
      '50+ edited photos',
      'Location of your choice',
      '2 outfit changes',
      'Professional retouching',
      'Digital delivery'
    ]
  },
  {
    id: 'event',
    name: 'Event Coverage',
    price: '₹50,000',
    popular: false,
    emoji: '🎉',
    features: [
      '6 hours coverage',
      '300+ edited photos',
      'Highlight video (3-5 min)',
      'Same-day preview',
      'All occasions covered',
      'Online gallery'
    ]
  },
  {
    id: 'prewedding',
    name: 'Pre-Wedding',
    price: '₹40,000',
    popular: true,
    emoji: '💕',
    features: [
      '4-5 hours session',
      '100+ edited photos',
      '1 location',
      'Creative concepts',
      'Props included',
      'Cinematic video'
    ]
  }
]

const PackagesSection = () => {
  const { enableAnimations } = useContext(PerformanceContext)

  return (
    <AnimatedSection id="packages" className="section-padding bg-dark-900/50">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary-400 text-sm font-medium uppercase tracking-wider">Pricing</span>
          <h2 className="heading-lg mt-2 mb-4">Photography Packages</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose the perfect package for your special moments
          </p>
        </div>

        {/* Package Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: enableAnimations ? index * 0.1 : 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className={`relative glass rounded-2xl p-6 ${
                pkg.popular ? 'border-primary-500/50' : 'border-dark-700'
              } border`}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-primary-500 to-accent-rose text-white text-xs font-medium rounded-full">
                    Popular
                  </span>
                </div>
              )}

              {/* Emoji & Name */}
              <div className="text-center mb-4 pt-2">
                <span className="text-4xl">{pkg.emoji}</span>
                <h3 className="text-xl font-semibold mt-2">{pkg.name}</h3>
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <span className="text-3xl font-bold gradient-text">{pkg.price}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                    <span className="text-primary-400 mt-0.5">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 rounded-xl font-medium transition-all ${
                  pkg.popular
                    ? 'bg-gradient-to-r from-primary-500 to-accent-rose text-white'
                    : 'bg-dark-700 text-white hover:bg-dark-600'
                }`}
              >
                Book Now
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Custom Package CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">Need a custom package?</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="btn-secondary"
          >
            Contact for Custom Quote
          </motion.button>
        </div>
      </div>
    </AnimatedSection>
  )
}

// ═══════════════════════════════════════════════════════════════
// ABOUT SECTION
// ═══════════════════════════════════════════════════════════════

const stats = [
  { icon: Camera, value: '500+', label: 'Photo Shoots' },
  { icon: Film, value: '100+', label: 'Videos Created' },
  { icon: Heart, value: '200+', label: 'Happy Couples' },
  { icon: Award, value: '5+', label: 'Years Experience' },
]

const AboutSection = () => {
  const filmmakerName = import.meta.env.VITE_FILMMAKER_NAME || 'PG Films'

  return (
    <AnimatedSection id="about" className="section-padding">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1552168324-d612d77725e3?w=800"
                alt="Photographer"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-gradient-to-br from-primary-500/20 to-accent-rose/20 rounded-2xl -z-10" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary-400 text-sm font-medium uppercase tracking-wider">About Me</span>
            <h2 className="heading-lg mt-2 mb-6">
              Passionate About Capturing Your <span className="gradient-text">Perfect Moments</span>
            </h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Hi, I'm the creative eye behind {filmmakerName}. With over 5 years of experience in photography 
              and filmmaking, I specialize in capturing the raw emotions and beautiful moments that make 
              your special day unforgettable.
            </p>
            <p className="text-gray-400 mb-8 leading-relaxed">
              My approach combines cinematic storytelling with candid photography, ensuring every 
              frame tells your unique story. From weddings to portraits, I'm here to turn your 
              precious moments into timeless memories.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-4 glass rounded-xl"
                >
                  <stat.icon className="w-6 h-6 mx-auto text-primary-400 mb-2" />
                  <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatedSection>
  )
}

// ═══════════════════════════════════════════════════════════════
// TESTIMONIALS SECTION
// ═══════════════════════════════════════════════════════════════

const testimonials = [
  {
    id: 1,
    name: 'Priya & Rahul',
    role: 'Wedding Client',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    rating: 5,
    text: 'Absolutely amazing work! They captured every beautiful moment of our wedding. The photos are stunning and the video made us cry happy tears. Highly recommended!'
  },
  {
    id: 2,
    name: 'Amit Sharma',
    role: 'Corporate Event',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    rating: 5,
    text: 'Professional, creative, and so easy to work with. The event coverage was exceptional. Every key moment was captured perfectly.'
  },
  {
    id: 3,
    name: 'Sneha Patel',
    role: 'Portrait Session',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    rating: 5,
    text: 'I felt so comfortable during the shoot. The photos turned out better than I ever imagined. True artistry!'
  }
]

const TestimonialsSection = () => {
  return (
    <AnimatedSection className="section-padding bg-dark-900/50">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary-400 text-sm font-medium uppercase tracking-wider">Testimonials</span>
          <h2 className="heading-lg mt-2 mb-4">What Clients Say</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Don't just take my word for it - hear from some of my happy clients
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-6"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} className="text-accent-gold fill-accent-gold" />
                ))}
              </div>

              {/* Text */}
              <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.text}"</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}

// ═══════════════════════════════════════════════════════════════
// CONTACT SECTION
// ═══════════════════════════════════════════════════════════════

const ContactSection = () => {
  const phone = import.meta.env.VITE_FILMMAKER_PHONE || '+91 98765 43210'
  const email = import.meta.env.VITE_FILMMAKER_EMAIL || 'pgfilms@gmail.com'
  const location = import.meta.env.VITE_FILMMAKER_LOCATION || 'Gujarat, India'
  const whatsapp = import.meta.env.VITE_FILMMAKER_WHATSAPP || '919876543210'

  return (
    <AnimatedSection id="contact" className="section-padding">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <span className="text-primary-400 text-sm font-medium uppercase tracking-wider">Contact</span>
            <h2 className="heading-lg mt-2 mb-6">Let's Create Something Beautiful</h2>
            <p className="text-gray-400 mb-8">
              Ready to capture your special moments? Get in touch and let's discuss how we can make your vision come to life.
            </p>

            {/* Contact Details */}
            <div className="space-y-4 mb-8">
              <a 
                href={`tel:${phone}`}
                className="flex items-center gap-4 p-4 glass rounded-xl hover:bg-dark-800 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <Phone size={20} className="text-primary-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="font-medium">{phone}</div>
                </div>
              </a>

              <a 
                href={`mailto:${email}`}
                className="flex items-center gap-4 p-4 glass rounded-xl hover:bg-dark-800 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <Mail size={20} className="text-primary-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium">{email}</div>
                </div>
              </a>

              <div className="flex items-center gap-4 p-4 glass rounded-xl">
                <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <MapPin size={20} className="text-primary-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="font-medium">{location}</div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              {[
                { icon: Instagram, url: import.meta.env.VITE_INSTAGRAM_URL, color: 'hover:text-pink-500' },
                { icon: Youtube, url: import.meta.env.VITE_YOUTUBE_URL, color: 'hover:text-red-500' },
                { icon: Facebook, url: import.meta.env.VITE_FACEBOOK_URL, color: 'hover:text-blue-500' },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-12 h-12 glass rounded-full flex items-center justify-center text-gray-400 ${social.color} transition-colors`}
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Contact Form or WhatsApp CTA */}
          <div className="glass rounded-2xl p-8">
            <h3 className="text-xl font-semibold mb-6">Quick Connect</h3>
            
            <div className="text-center py-8">
              <p className="text-gray-400 mb-6">
                The fastest way to reach me is through WhatsApp. Click below to start a conversation!
              </p>
              
              <motion.a
                href={`https://wa.me/${whatsapp}?text=Hi! I'm interested in your photography services.`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat on WhatsApp
              </motion.a>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-600"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-dark-900 text-gray-500 text-sm">or</span>
              </div>
            </div>

            <p className="text-center text-gray-500 text-sm">
              Use the chat widget in the bottom right corner to ask questions instantly! 💬
            </p>
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}

// ═══════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════

const Footer = () => {
  const filmmakerName = import.meta.env.VITE_FILMMAKER_NAME || 'PG Films'
  const year = new Date().getFullYear()

  return (
    <footer className="py-8 border-t border-dark-800">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {year} {filmmakerName}. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Made with <Heart size={14} className="inline text-accent-rose" /> for capturing memories
          </p>
        </div>
      </div>
    </footer>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN HOME COMPONENT
// ═══════════════════════════════════════════════════════════════

const Home = () => {
  return (
    <div className="relative">
      {/* 3D Background */}
      <Background3D />
      
      {/* Navigation */}
      <Navbar />
      
      {/* Main Content */}
      <main>
        <HeroSection />
        <PortfolioSection />
        <PackagesSection />
        <AboutSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Chat Widget */}
      <ChatWidget />
    </div>
  )
}

export default Home