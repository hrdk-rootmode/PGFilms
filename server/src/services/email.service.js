// ═══════════════════════════════════════════════════════════════
// PG FILMMAKER - Email Notification Service
// ═══════════════════════════════════════════════════════════════

import { sendEmail } from '../utils/helpers.js'
import { generateDailyBriefing } from './automation.service.js'
import { Config } from '../models/index.js'

// ═══════════════════════════════════════════════════════════════
// GET EMAIL PREFERENCES
// ═══════════════════════════════════════════════════════════════

export const getEmailPreferences = async () => {
  try {
    const config = await Config.findOne({ _id: 'email_preferences' })
    
    if (!config) {
      // Return defaults
      return {
        dailyBriefing: { enabled: true, time: '08:00' },
        newBooking: { enabled: true },
        highValueBooking: { enabled: true, threshold: 50000 },
        bookingConfirmed: { enabled: false },
        eventReminder: { enabled: true, daysBefore: 2 },
        overdueTasks: { enabled: true, time: '18:00' },
        unreadMessages: { enabled: false, hoursWait: 3 },
        weeklySummary: { enabled: true, day: 'monday', time: '09:00' },
        monthlyReport: { enabled: true, day: 1, time: '10:00' },
        lowEngagement: { enabled: false, daysThreshold: 7 }
      }
    }
    
    return config.data
  } catch (error) {
    console.error('Error getting email preferences:', error)
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
// UPDATE EMAIL PREFERENCES
// ═══════════════════════════════════════════════════════════════

export const updateEmailPreferences = async (preferences) => {
  try {
    await Config.findOneAndUpdate(
      { _id: 'email_preferences' },
      { 
        _id: 'email_preferences',
        type: 'email_preferences',
        data: preferences 
      },
      { upsert: true, new: true }
    )
    
    console.log('✅ Email preferences updated')
    return true
  } catch (error) {
    console.error('Error updating email preferences:', error)
    return false
  }
}

// ═══════════════════════════════════════════════════════════════
// SEND DAILY BRIEFING EMAIL
// ═══════════════════════════════════════════════════════════════

export const sendDailyBriefingEmail = async () => {
  try {
    const preferences = await getEmailPreferences()
    
    if (!preferences.dailyBriefing.enabled) {
      console.log('📧 Daily briefing email disabled')
      return
    }
    
    const adminConfig = await Config.findOne({ _id: 'admin' })
    const adminEmail = adminConfig?.data?.email || process.env.ADMIN_EMAIL
    
    if (!adminEmail) {
      console.log('❌ Admin email not configured')
      return
    }
    
    const briefing = await generateDailyBriefing()
    
    const subject = `📋 Daily Briefing - ${new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
          .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px; }
          .content { padding: 30px; }
          .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
          .priority-item { background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin-bottom: 15px; border-radius: 8px; }
          .priority-item.high { border-left-color: #ef4444; background: #fef2f2; }
          .priority-item.medium { border-left-color: #f59e0b; background: #fffbeb; }
          .priority-item.low { border-left-color: #3b82f6; background: #eff6ff; }
          .priority-title { font-weight: 600; color: #1f2937; font-size: 16px; margin-bottom: 5px; }
          .priority-action { color: #6b7280; font-size: 14px; }
          .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
          .stat-card { background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center; }
          .stat-number { font-size: 32px; font-weight: 700; color: #667eea; margin-bottom: 5px; }
          .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
          .insight { background: #f0f9ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .insight-icon { display: inline-block; margin-right: 10px; font-size: 20px; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; margin: 20px 0; font-weight: 600; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Daily Briefing</h1>
            <p>${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              Good morning! Here's what needs your attention today:
            </div>
            
            ${briefing.priorities.length > 0 ? `
              <h3 style="color: #1f2937; margin-bottom: 15px;">🎯 Today's Priorities</h3>
              ${briefing.priorities.map(p => `
                <div class="priority-item ${p.urgency}">
                  <div class="priority-title">${p.message}</div>
                  <div class="priority-action">→ ${p.action}</div>
                </div>
              `).join('')}
            ` : '<p style="color: #6b7280;">All caught up! No urgent items for today. 🎉</p>'}
            
            <h3 style="color: #1f2937; margin: 30px 0 15px 0;">📊 Quick Stats</h3>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number">${briefing.stats.pendingBookings || 0}</div>
                <div class="stat-label">Pending Bookings</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${briefing.stats.todayEvents || 0}</div>
                <div class="stat-label">Events Today</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${briefing.stats.unreadConversations || 0}</div>
                <div class="stat-label">Unread Messages</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${briefing.stats.upcomingEvents || 0}</div>
                <div class="stat-label">Events Tomorrow</div>
              </div>
            </div>
            
            ${briefing.insights.length > 0 ? `
              <h3 style="color: #1f2937; margin: 30px 0 15px 0;">💡 AI Insights</h3>
              ${briefing.insights.slice(0, 2).map(insight => `
                <div class="insight">
                  <span class="insight-icon">${insight.icon === 'trending-up' ? '📈' : insight.icon === 'trending-down' ? '📉' : '💡'}</span>
                  <strong>${insight.message}</strong>
                  <p style="margin: 10px 0 0 30px; color: #6b7280; font-size: 14px;">${insight.suggestion}</p>
                </div>
              `).join('')}
            ` : ''}
            
            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/admin" class="cta-button">
                Open Dashboard →
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>PG Filmmaker Admin Dashboard</p>
            <p>This email was sent automatically based on your notification preferences.</p>
            <p><a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/settings" style="color: #667eea;">Update Preferences</a></p>
          </div>
        </div>
      </body>
      </html>
    `
    
    await sendEmail({
      to: adminEmail,
      subject,
      html
    })
    
    console.log('✅ Daily briefing email sent to', adminEmail)
    
  } catch (error) {
    console.error('❌ Error sending daily briefing email:', error)
  }
}

// ═══════════════════════════════════════════════════════════════
// SEND NEW BOOKING NOTIFICATION
// ═══════════════════════════════════════════════════════════════

export const sendNewBookingEmail = async (booking) => {
  try {
    const preferences = await getEmailPreferences()
    
    // Check if high-value (special handling)
    const isHighValue = booking.estimatedValue > (preferences.highValueBooking.threshold || 50000)
    
    if (!preferences.newBooking.enabled && !isHighValue) {
      return
    }
    
    if (isHighValue && !preferences.highValueBooking.enabled) {
      return
    }
    
    const adminConfig = await Config.findOne({ _id: 'admin' })
    const adminEmail = adminConfig?.data?.email || process.env.ADMIN_EMAIL
    
    if (!adminEmail) return
    
    const subject = isHighValue 
      ? `🌟 VIP BOOKING: ${booking.name} - ₹${booking.estimatedValue?.toLocaleString()}`
      : `📸 New Booking: ${booking.name}`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: ${isHighValue ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}; padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
          ${isHighValue ? '.vip-badge { background: white; color: #ef4444; display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: 600; margin-top: 10px; }' : ''}
          .content { padding: 30px; }
          .booking-details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: 600; color: #6b7280; width: 120px; }
          .detail-value { color: #1f2937; flex: 1; }
          .action-buttons { margin: 20px 0; text-align: center; }
          .btn { display: inline-block; padding: 12px 24px; margin: 0 5px; border-radius: 8px; text-decoration: none; font-weight: 600; }
          .btn-primary { background: #10b981; color: white; }
          .btn-secondary { background: #3b82f6; color: white; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isHighValue ? '🌟 VIP BOOKING ALERT' : '📸 New Booking Received'}</h1>
            ${isHighValue ? '<div class="vip-badge">High-Value Client</div>' : ''}
          </div>
          
          <div class="content">
            <p style="font-size: 16px; color: #1f2937;">A new booking has been received!</p>
            
            <div class="booking-details">
              <div class="detail-row">
                <div class="detail-label">Client:</div>
                <div class="detail-value"><strong>${booking.name}</strong></div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Package:</div>
                <div class="detail-value">${booking.package}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Event Date:</div>
                <div class="detail-value">${new Date(booking.eventDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Location:</div>
                <div class="detail-value">${booking.location || 'Not specified'}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Phone:</div>
                <div class="detail-value">${booking.phone}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Email:</div>
                <div class="detail-value">${booking.email || 'Not provided'}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Value:</div>
                <div class="detail-value"><strong style="color: #10b981; font-size: 18px;">₹${booking.estimatedValue?.toLocaleString() || 'TBD'}</strong></div>
              </div>
            </div>
            
            ${booking.specialRequests ? `
              <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <strong style="color: #92400e;">Special Requests:</strong>
                <p style="margin: 10px 0 0 0; color: #78350f;">${booking.specialRequests}</p>
              </div>
            ` : ''}
            
            <div class="action-buttons">
              <a href="https://wa.me/91${booking.phone.replace(/\D/g, '')}" class="btn btn-primary">💬 WhatsApp Client</a>
              <a href="tel:+91${booking.phone}" class="btn btn-secondary">📞 Call Now</a>
            </div>
            
            <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/bookings" style="color: #667eea;">View in Dashboard →</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
    
    await sendEmail({ to: adminEmail, subject, html })
    
    console.log(`✅ ${isHighValue ? 'VIP' : 'New'} booking email sent for ${booking.name}`)
    
  } catch (error) {
    console.error('❌ Error sending new booking email:', error)
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
  getEmailPreferences,
  updateEmailPreferences,
  sendDailyBriefingEmail,
  sendNewBookingEmail
}