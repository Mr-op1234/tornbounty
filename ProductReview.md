# Product Requirements Document (PRD)

## Product Name:

**Torn Bounty Assist**

## Purpose:

Assist players in the game "Torn" to efficiently manage and prioritize bounty targets based on uploaded bounty lists.

## Target Audience:

Players of the game "Torn" who actively pursue bounties and need an automated, efficient filtering and ranking system.

---

## App Structure Overview:

The application is divided into two main interfaces:

### APP INTERFACE 1: Upload Docs

* **Component: Terms and Conditions Dropdown**

  * Type: UI dropdown
  * Purpose: Show T\&C before document upload.
  * Text:

    * The app assists in bounty collection.
    * The user is responsible for any abuse of the app.

* **Component: UPLOAD DOCS**

  * Type: File Upload Button
  * Function: Accepts XLSX file, converts to CSV internally before processing.
  

* **Data Validation**

  * Ensures XLSX is valid.
  * Converts to CSV.

### APP INTERFACE 2: Dashboard

* **Component: Enter Your Level**

  * Type: Input Field, should be within 0-100.
  * Validation: Accepts integers only, must be > 0

* **Component: Get Player Details Button**

  * Executes logic:

    1. Filter players with level < user input.
    2. Sort primarily by Reward (descending).
    3. Secondary sort by Quantity (descending).
    4. Status hierarchy: Okay > Hospital > Abroad > Travelling.

* **Component: Output Display**

  * Displays top recommendation:

    ```
    | Reward | Name | Level | Quantity | Status |
    ```

* **Component: Navigation Buttons (Next / Back)**

  * Iterates through ranked results based on filters and sort logic.

* **Error Handling:**

  * If user level is too low → "No such Players"

* **Data Cleaning:**

  * Remove literals from Level/Quantity
  * Status values must be from the predefined list

* **Product Mermaid Diagram**
flowchart TD

%% APP INTERFACE 1
A1[APP INTERFACE 1:\nUpload Docs] --> A2[Terms and Conditions dropdown:\n(Checkbox or dropdown to view T&C)]
A2 --> A3[UPLOAD DOCS\n(Button: Accepts XLSX file,\nconverts to CSV before processing)]
A3 --> A4[Data should be within limit 0 to 100]
A1 --> TnC[Terms and Conditions:\n1. App is purely to assist in bounty collection.\n2. User is responsible for their own use.]

%% Transition to Dashboard
A3 --> B1[APP INTERFACE 2:\nDashboard]

%% APP INTERFACE 2
B1 --> B2[Enter your level:\n(Input field)]
B2 --> B3[GET PLAYER DETAILS\n(Button)]
B3 --> C1[Algorithm Execution:\n1. Filter players < entered level\n2. Sort: Reward ↓ then Quantity ↓\n3. Status priority:\n   Okay > Hospital > Abroad > Travelling\n4. Priority Ranking:\n   Status > Reward > Quantity]
C1 --> C2[Data Cleaning:\n1. Remove non-numeric in Level/Quantity\n2. Status must be valid]
C1 --> C3[Error Handling:\nIf input level too low → Show "No such Players"]

%% Output Display
B3 --> D1[Output Display:\n| Reward | Name | Level | Quantity | Status |]
D1 --> E1[Next ->\n(Button: Show next target)]
D1 --> E2[<- Back\n(Button: Show previous target)]

---

