# 🎯 Torn Bounty Assist

A web application designed to help Torn players efficiently manage and prioritize bounty targets based on uploaded bounty lists.

## 🚀 Live Website

**Access the app:** [https://tornbounty.vercel.app/](https://tornbounty.vercel.app/)

## 📋 Features

- **File Upload**: Upload XLSX bounty files with drag & drop support
- **Smart Processing**: Automatically detects and cleans bounty data
- **Flexible Column Detection**: Works with any column order (Reward, Target, Level, Status, Quantity)
- **Advanced Filtering**: Filter targets by your level
- **Priority Sorting**: 
  - Primary: Status (Okay > Hospital > Abroad > Traveling)
  - Secondary: Reward (highest first)
  - Tertiary: Quantity (highest first)
- **Mobile Responsive**: Works perfectly on phones and tablets
- **Dark Theme**: Matches Torn's aesthetic with gray color scheme

## 🎮 How to Use

1. **Accept Terms**: Check the terms and conditions
2. **Upload File**: Drop your XLSX bounty file or click to browse
3. **Enter Level**: Input your current Torn level (1-100)
4. **Get Targets**: Click "Get Player Details" to see filtered results
5. **Navigate**: Use Next/Back buttons or arrow keys to browse targets

## 📊 File Format

The app accepts XLSX files with these columns (any order):
- **Reward/Bounty/Money**: Bounty amount
- **Target/Name/Player**: Player username
- **Level/Lvl**: Player level
- **Status/State**: Player status (Okay, Hospital, Abroad, Traveling)
- **Quantity/Qty**: Available quantity

## 📁 Daily Updates

Fresh bounty data is updated daily in the **BOUNTY CHEAT SHEET** folder. Check back regularly for the latest bounty lists!

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **File Processing**: SheetJS (XLSX parsing)
- **Hosting**: Vercel
- **Theme**: Dark gray (Torn-inspired)

## 🔒 Privacy

- **Client-side processing**: All data stays in your browser
- **No data storage**: Files are processed locally, not saved anywhere
- **No tracking**: Pure static website with no analytics

## 📱 Mobile Support

Fully responsive design that works on:
- 📱 Phones (iOS/Android)
- 📱 Tablets
- 💻 Desktop computers

## ⚡ Performance

- **Fast loading**: Minimal dependencies
- **Offline capable**: Works without internet after initial load
- **Browser memory**: Uses RAM for instant processing

## 🎯 Target Audience

Active Torn players who pursue bounties and need an automated, efficient filtering and ranking system.

---

**Made for the Torn community** 🎮

*Last updated: July 2025*
