import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Crown, ArrowRight } from 'lucide-react'

const EnhancedPackageCard = ({ pkg, index, onSelect }) => {
  const isPopular = pkg.popular

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ y: -10 }}
      onClick={() => onSelect(pkg)}
      className="relative cursor-pointer h-full"
    >
      {/* Popular Badge */}
      {isPopular && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20 w-full flex justify-center"
        >
          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-accent-gold to-yellow-500 rounded-full shadow-lg shadow-accent-gold/30">
            <Crown className="w-3.5 h-3.5 text-dark-900" />
            <span className="text-dark-900 text-xs font-bold uppercase tracking-wide">
              Most Popular
            </span>
          </div>
        </motion.div>
      )}

      {/* Card Container */}
      <div
        className={`
          relative h-full rounded-2xl p-6 sm:p-8
          backdrop-blur-md transition-all duration-400 overflow-hidden
          ${isPopular
            ? 'bg-gradient-to-b from-primary-500/10 to-dark-900 border-2 border-primary-500/50 shadow-2xl shadow-primary-500/20'
            : 'bg-dark-800/90 border border-dark-700 hover:border-primary-500/40 hover:shadow-xl hover:shadow-primary-500/10'
          }
        `}
      >
        {/* Background Glow for Popular */}
        {isPopular && (
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-primary-500/15 rounded-full blur-3xl pointer-events-none" />
        )}

        {/* Package Header */}
        <div className="relative z-10 text-center mb-6">
          {/* Emoji Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.2 + index * 0.1,
              type: "spring",
              stiffness: 200
            }}
            className={`
              inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4
              ${isPopular
                ? 'bg-gradient-to-br from-primary-500/20 to-accent-rose/20 ring-2 ring-primary-500/30'
                : 'bg-dark-700/80'
              }
            `}
          >
            <span className="text-4xl">{pkg.emoji}</span>
          </motion.div>

          {/* Package Name */}
          <h3
            className={`
              text-xl sm:text-2xl font-bold font-display mb-3
              ${isPopular
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-rose'
                : 'text-white'
              }
            `}
          >
            {pkg.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline justify-center">
            <span
              className={`
                text-3xl sm:text-4xl font-bold
                ${isPopular ? 'text-primary-400' : 'text-white'}
              `}
            >
              {pkg.price}
            </span>
          </div>

          {/* Description */}
          {pkg.description && (
            <p className="text-dark-400 text-sm mt-3 leading-relaxed">
              {pkg.description}
            </p>
          )}
        </div>

        {/* Divider */}
        <div
          className={`
            h-px w-full mb-6
            ${isPopular
              ? 'bg-gradient-to-r from-transparent via-primary-500/50 to-transparent'
              : 'bg-dark-700'
            }
          `}
        />

        {/* Features List */}
        <div className="space-y-3 mb-8">
          {pkg.features.slice(0, 5).map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + idx * 0.05 + index * 0.05 }}
              className="flex items-start gap-3"
            >
              <div
                className={`
                  flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5
                  ${isPopular
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'bg-accent-cyan/10 text-accent-cyan'
                  }
                `}
              >
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
              <span className="text-dark-300 text-sm leading-relaxed">
                {feature}
              </span>
            </motion.div>
          ))}
        </div>

        {/* More Features Count */}
        {pkg.features.length > 5 && (
          <p className="text-center text-xs text-dark-500 mb-6">
            + {pkg.features.length - 5} more features included
          </p>
        )}

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            w-full py-3.5 px-6 rounded-xl font-semibold text-sm
            flex items-center justify-center gap-2
            transition-all duration-300
            ${isPopular
              ? 'bg-gradient-to-r from-primary-500 to-accent-rose text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:from-primary-600 hover:to-accent-rose'
              : 'bg-dark-700 text-white border border-dark-600 hover:bg-dark-600 hover:border-dark-500'
            }
          `}
        >
          <span>{isPopular ? 'Book This Package' : 'Select Package'}</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>

        {/* Bottom Highlight for Popular */}
        {isPopular && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-accent-rose to-primary-500" />
        )}
      </div>
    </motion.div>
  )
}

export default EnhancedPackageCard