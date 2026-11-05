# RMS Rhone

Build a polished, modern travel planning web application that combines the organizational strengths of TripIt with a much more flexible and visual day-by-day, hour-by-hour trip planning experience.

The core purpose of the application is:

Give travelers one place to plan, organize, coordinate, and access every detail of a trip—from the first flight to individual restaurant reservations, hikes, activities, transportation, documents, expenses, and notes.

This is an MVP. Do NOT add AI features yet. Do not add AI recommendations, AI itinerary creation, chat assistants, AI trip optimization, or generative features. The product architecture should make it easy to add those later, but the first version should focus on excellent manual planning and organization.

PRODUCT PRINCIPLES

The application should feel:

Beautiful but highly functional

Easy enough for casual vacation planning

Detailed enough for complex international trips

Collaborative for group travel

Mobile-friendly because users will reference it constantly while traveling

Visual rather than spreadsheet-like

Organized around trips, days, and individual agenda items

Flexible enough that users can plan everything down to the hour OR leave portions of a day open

Useful before, during, and after the trip

Think of the experience as:

Trip dashboard → Trip → Day → Agenda Item → All Details

Every important piece of travel information should be accessible within 1–2 clicks.

PRIMARY NAVIGATION

Create the following main navigation:

1. Home / Trips

2. Explore / Saved Places

3. Shared With Me

4. Travel Profile

5. Settings

The Trips page should be the main landing page after login.

HOME / TRIPS DASHBOARD

Create a beautiful dashboard showing:

Upcoming Trips

Large visual cards containing:

Destination

Trip name

Dates

Countdown until departure

Cover photo

Travelers

Number of days

Trip status: Planning / Booked / In Progress / Completed

Example:

Brazil Adventure
Rio de Janeiro + Búzios
January 2–14
4 travelers
124 days away

Clicking the card opens the trip.

Past Trips

Show completed trips separately.

Allow users to:

Create Trip

Duplicate Trip

Archive Trip

Delete Trip

Share Trip

CREATE A TRIP

When someone selects "Create Trip," open a clean creation flow.

Fields:

Trip name

Primary destination

Additional destinations

Start date

End date

Home/origin city

Trip type

Vacation

Weekend

Road trip

Business

Group trip

Adventure

Other

Cover image

Currency

Travelers

Notes

Once saved, automatically create a day for every date of the trip.

For example:

January 2
January 3
January 4
January 5
etc.

TRIP WORKSPACE

When a user opens a trip, create a centralized trip workspace.

At the top display:

Brazil Adventure

January 2–14, 2027

Rio de Janeiro → Ilha Grande → Búzios

Include:

Weather placeholder

Travelers

Share button

Edit Trip

Trip countdown

Create these trip-level tabs:

Overview

Itinerary

Reservations

Map

Saved

Budget

Documents

Travelers

The Itinerary should be the primary and most important experience.

OVERVIEW TAB

Create a visual trip overview.

Show:

Trip Route

Origin → Destination 1 → Destination 2 → Destination 3 → Home

Example:

San Francisco
↓
Rio de Janeiro
↓
Ilha Grande
↓
Búzios
↓
San Francisco

Upcoming Reservations

Show the next few important reservations:

Flight

Hotel

Transportation

Activity

Restaurant

Trip Summary

Show:

13 days

3 destinations

4 travelers

2 flights

3 accommodations

11 activities

6 restaurants

Total planned spend

Planning Progress

Show simple progress:

Flights
Accommodation
Transportation
Activities
Restaurants
Documents

Do not require everything to be completed.

ITINERARY — CORE FEATURE

This is the most important part of the application.

The itinerary must allow users to plan the trip:

Day by day AND hour by hour.

Create a vertical timeline interface.

At the top allow:

Entire Trip

Day View

Compact View

The default should show the entire trip broken into days.

Example:

SATURDAY · JANUARY 2

San Francisco → Rio de Janeiro

6:30 AM
Leave for SFO

8:00 AM
Arrive at SFO

10:15 AM
Flight to Rio

SUNDAY · JANUARY 3

Rio de Janeiro

8:00 AM
Breakfast

9:30 AM
Christ the Redeemer

12:30 PM
Lunch

2:00 PM
Explore Santa Teresa

6:00 PM
Return to hotel

8:00 PM
Dinner

10:30 PM
Nightlife

Users must be able to:

Add agenda item

Edit agenda item

Delete agenda item

Duplicate agenda item

Drag agenda items into a different order

Move agenda items to another day

Change start/end times

Create unscheduled items

Mark things as booked

Mark things as completed

Add free time

Add notes between activities

Include an Unscheduled / Ideas section at the bottom or side of the itinerary where activities can sit before being assigned to a day.

Allow users to drag items from Unscheduled into a specific day.

AGENDA ITEM TYPES

When users click "+ Add", allow them to choose:

Flight

Hotel / Accommodation

Restaurant

Activity

Tour

Hiking

Beach

Diving / Water Activity

Nightlife

Transportation

Train

Bus

Ferry

Rental Car

Meeting

Event

Shopping

Free Time

General Plan

Note

Custom

Each type should have a recognizable icon.

AGENDA ITEM DETAILS

Every agenda item needs its own detailed page/modal.

This is extremely important.

A user should be able to click any itinerary item and see EVERYTHING associated with it.

Include:

Basic Information

Title

Category

Date

Start time

End time

Time zone

Status

Idea

Planned

Need to Book

Reserved

Confirmed

Completed

Cancelled

Location

Venue/location name

Full address

City

Country

Map

Directions link

Latitude/longitude if available

Reservation Information

Reservation status

Confirmation number

Booking provider

Booking URL

Reservation name

Reservation email

Reservation phone number

Cost

Estimated cost

Actual cost

Currency

Paid?

Who paid?

Shared or individual expense

Travelers

Allow users to indicate which travelers are participating.

Example:

✓ Adeline
✓ Sarah
✓ Emily
○ Megan

Contact Information

Company/vendor

Contact name

Phone

Email

Website

Documents / Attachments

Allow attachment of:

Ticket

PDF

Screenshot

QR code

Reservation confirmation

Boarding pass

Waiver

Menu

Travel document

Image

Links

Users should be able to save multiple URLs.

Examples:

Website
Google Maps
Booking page
Instagram
TikTok
Blog
AllTrails
Dive operator page

Each link can have a custom label.

Notes

Large notes section supporting multiple lines.

Cancellation Information

Cancellation deadline

Cancellation policy

Refundable?

Cancellation notes

Transportation

Allow users to attach transportation information for getting TO or FROM the activity.

Example:

Hotel → Marina

Transportation type: Taxi
Departure: 7:15 AM
Travel time: 25 minutes
Estimated cost: $18

VISUAL ITINERARY CARDS

Agenda cards should be visually scannable.

For example:

9:00 AM – 12:30 PM

🥾 Hike Pedra da Gávea

📍 Rio de Janeiro

3 hr 30 min

Status: Confirmed

$45

Participants: 4

Click to view details.

Use subtle category icons and status badges rather than overwhelming the interface with colors.

TRAVEL TIME BETWEEN AGENDA ITEMS

Between agenda items, allow users to manually add transportation/travel time.

Example:

Christ the Redeemer

↓

🚕 25 min drive

↓

Lunch at Aprazível

Allow:

Walk

Drive

Taxi / rideshare

Public transit

Train

Bus

Ferry

Flight

Bike

Other

Show travel time visually between itinerary items.

Do not calculate travel times automatically yet.

Users can manually enter them.

RESERVATIONS TAB

Create a TripIt-inspired centralized reservations area.

Organize reservations by category:

Flights

Accommodation

Transportation

Restaurants

Activities

Other

Each reservation card should show:

Provider

Date

Time

Location

Confirmation number

Traveler

Cost

Status

Documents

Clicking a reservation opens its associated agenda item.

Reservations and itinerary items should NOT be separate duplicated objects.

A reservation is simply an itinerary item with reservation details.

Updating one updates the other.

FLIGHT DETAILS

Flight agenda items need additional fields:

Airline

Flight number

Confirmation number

Departure airport

Departure terminal

Departure gate

Departure date/time

Arrival airport

Arrival terminal

Arrival gate

Arrival date/time

Seat

Cabin/class

Aircraft

Baggage information

Traveler

Booking provider

Ticket number

Cost

Documents

Notes

Display flights as visually distinct flight cards.

ACCOMMODATION DETAILS

Hotel/Airbnb items should include:

Property name

Address

Map

Check-in date/time

Check-out date/time

Confirmation number

Room/property details

Number of guests

Host/contact

Phone

Booking platform

Booking URL

Cost

Amount paid

Amount remaining

Cancellation policy

Amenities

Wi-Fi information

Check-in instructions

Attachments

Notes

Accommodation should visually span all days the traveler stays there.

TRANSPORTATION DETAILS

Support:

Rental cars

Trains

Buses

Ferries

Private transfers

Taxi

Rideshare

Public transit

Fields should dynamically change depending on transportation type.

Include:

Provider

Departure

Arrival

Reservation number

Pickup location

Drop-off location

Date/time

Travelers

Cost

Documents

Notes

MAP TAB

Create a map-based trip view.

Display saved locations and itinerary items as pins.

Users should be able to filter pins:

Accommodation

Restaurants

Activities

Hiking

Beaches

Nightlife

Transportation

Saved / Ideas

Create a list next to or below the map.

Clicking a location should open its agenda item or saved-place details.

For the initial version, if a live map integration is not configured, create the full map UI using a placeholder/map component and prepare the architecture for Google Maps or Mapbox integration later.

SAVED / IDEAS

Travel planning happens before something becomes part of an itinerary.

Create a Saved section where users can store potential:

Restaurants

Activities

Hiking trails

Beaches

Bars

Hotels

Shops

Tours

Neighborhoods

Day trips

General places

Each saved place contains:

Name

Category

Location

URL

Image

Notes

Estimated cost

Priority

Destination

Tags

Priority:

⭐ Must Do
♡ Want to Do
○ Maybe

Users should be able to click:

Add to Itinerary

Then select:

Day → Time

Do not delete the saved item when it is added to the itinerary. Instead indicate that it has been scheduled.

ADD PLACE FROM LINK

Include an "+ Add From Link" experience.

Users can paste links from:

Google Maps

Instagram

TikTok

Blogs

Restaurant websites

Booking sites

AllTrails

Viator

GetYourGuide

Airbnb

Other websites

For this MVP, do NOT use AI to interpret these links.

Simply:

Store the original URL.

Ask the user to provide/edit the place name.

Select category.

Add location.

Add notes.

Save it.

Design the database so automated link extraction can be added later.

BUDGET

Create a trip budget tab.

Show:

Total Trip Budget

Planned
Booked
Paid
Remaining

Break down spending:

Flights

Accommodation

Transportation

Food

Activities

Nightlife

Shopping

Miscellaneous

Each agenda item can have:

Estimated Cost
Actual Cost

Allow users to mark:

Paid / Not Paid

And:

Paid By

Create a simple expense splitting system.

Example:

Dinner — $240
Paid by Adeline
Split between Adeline, Sarah, Emily, Megan

Calculate:

Sarah owes Adeline $60
Emily owes Adeline $60
Megan owes Adeline $60

Create a "Balances" section summarizing who owes whom.

DOCUMENTS

Create one centralized Documents tab.

Documents should also remain associated with their individual agenda items.

Categories:

Flights

Hotels

Activities

Transportation

Travel Documents

Insurance

Other

Support:

PDF

JPG

PNG

Show:

Document name

Related itinerary item

Date

Category

Uploaded by

Include upload, preview, download and delete actions.

TRAVELERS & COLLABORATION

Trips should support multiple travelers.

Each traveler has:

Name

Profile photo / avatar

Email

Role

Roles:

Owner

Full permissions

Editor

Can create and edit plans

Viewer

Can view but not edit

Allow users to invite people by email.

Show traveler avatars throughout the itinerary.

Allow agenda items to apply to:

Everyone

OR

Selected travelers.

This is important because people on group trips may do different activities.

COMMENTS

Allow comments on individual agenda items.

Example:

Sarah:
"Do we need to reserve this ahead of time?"

Adeline:
"Yes — booking opens 30 days out."

Show timestamp and commenter.

Keep comments lightweight.

TRAVEL PROFILE

Create a traveler profile where users can store travel-related information.

Include:

Full name

Preferred name

Home airport

Phone

Emergency contact

Known traveler number

Frequent flyer programs

Hotel loyalty programs

Rental car programs

Do NOT store passport numbers, credit card numbers, or highly sensitive information in the MVP.

CALENDAR

Include an "Add to Calendar" / "Calendar Export" option at the trip level.

The architecture should eventually support Google Calendar, Apple Calendar and Outlook.

For the initial version, create the UI and allow creation of an .ics-compatible itinerary structure if possible.

TRIP SHARING

Include a prominent Share button.

Users can:

Invite traveler
Invite editor
Share view-only trip

Create a clean read-only trip view that can be sent to friends or family.

A viewer should be able to see:

Trip overview

Itinerary

Reservation times

Locations

Relevant trip details

Sensitive/private fields should eventually be configurable.

DAY VIEW

Create a dedicated day view optimized for actual travel.

Example header:

Monday, January 5

Rio de Janeiro

Then show the chronological agenda.

Include a toggle:

PLANNING VIEW | TRAVEL VIEW

Planning View

Shows all editing controls, unscheduled items, drag/drop, costs, etc.

Travel View

Simplified.

Only show what the traveler needs today:

Current activity
Next activity
Time
Address
Directions
Reservation info
Tickets/documents
Notes
Transportation to next stop

Travel View should be highly optimized for mobile.

CHECKLISTS

Create a trip-level checklist.

Default sections:

Before Booking

Before Departure

Packing

Documents

Reservations

Custom

Users can:

Add task
Mark complete
Assign traveler
Set due date
Add notes

Allow custom checklist sections.

SEARCH

Add trip-level search.

Users should be able to search for:

Restaurant

Reservation number

Location

Activity

Note

Traveler

Document

Confirmation number

Example:

Searching "scuba" should show every diving-related itinerary item and saved place within the trip.

FILTERING

Allow itinerary filtering by:

Traveler

Category

Status

Booked / Unbooked

Paid / Unpaid

Destination

DESIGN DIRECTION

The application should NOT feel like enterprise project management software.

Avoid:

Dense tables

Excessive borders

Tiny text

Corporate dashboards

Too many buttons

Overwhelming forms

Instead use:

White space

Large destination photography

Rounded cards

Elegant typography

Clear icons

Visual timelines

Easy-to-scan itinerary cards

Soft neutral backgrounds

Destination imagery

Modern travel-app aesthetic

Think:

Airbnb visual polish + TripIt organization + modern calendar/timeline planning.

Use a responsive design.

Desktop should provide more planning controls.

Mobile should prioritize the itinerary and travel-day experience.

IMPORTANT UX DETAILS

Make adding an itinerary item extremely fast.

The first "+ Add Plan" form should ONLY require:

Title
Date
Start time
Category

Everything else should be optional.

After creation, users can open the item and add the detailed information.

Do not force users through a giant form simply to add "Dinner."

Support autosave where appropriate.

Use confirmation dialogs before destructive actions.

Use empty states that explain what to do.

DATA MODEL

Structure the backend around these primary objects:

User

Trip

TripTraveler

TripDay

AgendaItem

SavedPlace

Document

Comment

Expense

Checklist

ChecklistItem

Link

TravelerProfile

AgendaItem should be the central object.

Flights, hotels, restaurants, activities, and transportation are different agenda item types rather than completely separate systems.

Each AgendaItem can have:

trip_id

date

start_time

end_time

category

title

description

location

status

participants

cost

reservation data

attachments

links

notes

transportation information

comments

This structure is important because future AI capabilities will eventually operate on the same itinerary data.

AUTHENTICATION & DATA

Use Supabase for:

Authentication

Database

File storage

User permissions

Trip sharing

Users should only be able to access:

Trips they own

OR

Trips explicitly shared with them.

Implement Row Level Security appropriately.

SAMPLE DATA

Populate the prototype with a realistic sample trip so the application does not initially feel empty.

Create:

Brazil Adventure

January 2–14

Destinations:

Rio de Janeiro
Ilha Grande
Búzios

Include realistic sample:

Flight
Hotels
Airport transportation
Hike
Waterfall excursion
Scuba diving
Beach
Restaurant
Ferry
Nightlife
Free time

Show multiple travelers.

Include scheduled and unscheduled items.

Include one example reservation with a confirmation number, document, notes, cost, and transportation details.

This sample trip should demonstrate the entire product experience.

DO NOT BUILD YET

Do NOT add:

AI itinerary generation

AI chat

AI recommendations

AI trip optimization

AI link extraction

AI email parsing

AI travel assistant

Automatic weather-based replanning

Automatic route optimization

Automatic restaurant recommendations

Automated travel research

These will be added in later phases.

However, keep the application modular so these capabilities can eventually interact with Trips, Days, Agenda Items, Saved Places, Travelers, and Reservations.

INITIAL BUILD PRIORITIES

Prioritize getting these experiences excellent:

Trips dashboard

Create/edit trip

Trip workspace

Day-by-day itinerary

Hour-by-hour agenda planning

Detailed agenda item pages

Drag/drop scheduling

Reservations

Saved places / ideas

Documents

Travelers and sharing

Budget

Checklists

Mobile Travel View

Do not create fake buttons that do nothing.

If a feature cannot be fully implemented in the first build, either create a clearly marked placeholder state or leave it out rather than presenting non-functional functionality.

The single most important workflow to perfect is:

Create Trip → Add Plan → Schedule It → Attach All Relevant Details → See It Chronologically → Open It While Traveling

Build the application so this flow feels exceptionally intuitive.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://rmsrhone.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9b9bac07-4839-432d-a049-8a5d355f32db).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
