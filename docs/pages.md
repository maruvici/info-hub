# Pages
0. Guidelines for all pages
    - All pages must be responsive, mobile friendly, and adapt beautifully to all screen sizes
    - All pages must be modern and sleek looking
    - Each page must include a button (either in header or as a sticky button) that toggles between Light Mode and Dark Mode
        - Light Mode Color Palette: White + Light Gray + Sky Blue
        - Dark Mode Color Palette: Black + Dark Gray + Navy Blue
    - Buttons, cards, and other interactive components must have highlighting effects when hovered on
    - Like (Heart) buttons must indicate if a post or comment has already been liked by the current user
1. Landing Page
    - Features:
        - Header with prominent Login and Sign Up buttons that stick to the top
        - Logo with Title must be located on the left side of header
        - Hero section with a compelling headline and clear call-to-action buttons
        - Features grid showcasing six key benefits of the platform (knowledge base, discussions, smart search, trending topics, community, and quality content)
        - Mock post previews displayed in a locked/blurred state with an overlay prompting users to sign up, demonstrating what content awaits behind authentication
        - Final CTA section with another opportunity to sign up
        - Footer with standard links
2. Login Page
    - Features:
        - Minimalist modern looking page with centered login box
        - In the upper section of login box contains Email and Password inputs
        - In the lower section of login box contains Login with Microsoft Account
        - Directly below login box includes "Don't have an account? Sign Up Now" text
        - Footer with standard links
3. Main Forum/KnowledgeBase Page
    - Features:
        - Sticky header with logo and title on the left
        - Sticky header with user icon and global search that filters through titles, contents, tags, and post type on the right
        - Filter sidebar includes content type (i.e. post type) radio buttons (all/articles/discussions/inquiries)
        - Filter sidebar includes tags checkboxes
        - Main content area displays knowledge base posts in cards which can be sorted by Most Views, Most Liked, Most Recent
        - Post cards include a logo (based on post_type), the post's title, tags, author, Posted Date, view count, and votes count
        - Main content area should only display 10 results at a time with a page selector on the bottom
        - Footer with standard links
4. User Page
    - Features:
        - Sticky header with logo and title on the left
        - Sticky header with user icon and global search that filters through titles, contents, tags, and post type on the right
        - Sidebar with User's Profile Photo in a circular frame with "User Details, Posts, and Settings" buttons
        - Main content area when under user details include User's Name, Email, Team, Role, Overall Number of Post Views, Overall Number of Likes (from posts and comments)
        - Main content area when under posts details include post cards (same format as main forum post cards) of User which can be sorted by Most Views, Most Liked, Most Recent
        - Main content area when under settings include buttons for changing password, changing team, and changing profile picture
5. Post Page
    - Features:
        - Sticky header with logo and title on the left
        - Sticky header with user icon and global search that filters through titles, contents, tags, and post type on the right
        - Main content area displays the post title in large text with Author, Posted Date, Content Type, and Tags below it with smaller text
        - Below that is the Post's content in regular text size
        - Below the post's content includes any a link to any attachments the post may have with an icon (based on file type) and title as hypertext
        - Below the post's attachments is a like (heart) button with the number of likes beside it and the view count beside it too
        - After the post section is the comment section
            - On the top, there must be an input text box with the user's icon on the left and a comment button on the right
            - After that is a list of comments for the post which can be sorted by Most Liked and Most Recent
            - Each comment is a card containing the profile icon and name of its author, the comment's creation date, the content of the comment, the number of likes of the comment, a like button, and a reply button
                - If the reply button is pressed, a input text box with a user's icon on the left and a reply button on the right must appear
            - Comments which are replies to other comments follow the same format as a normal comment, but must appear nested under the parent comment
6. Create Post Page
    - Features:
        - Sticky header with logo and title on the left
        - Sticky header with user icon and global search that filters through titles, contents, tags, and post type on the right
        - At the top of the main content area includes a "What post do you want to make?" type of prompty as header
        - Main content area includes a section to specify post type
        - Main content area includes input text boxes for title and for content
        - Main content area includes a section to add tags
        - The input text box for post content should be rich text editor which supports text styling (e.g. bold, italic, lists, links, code)
            - If the rich text editor also supports attachments and can display the file name and file type after upload, ignore the next feature
        - Below the content text box, there should be an upload attachments button whereupon the successful upload of attachment displays the filename and filetype above it
        - At the end of the main content area, there should be a submit post button which submits the post and redirects to the dashboard
7. Sign Up Page
    - Features:
        - Minimalist modern looking page with centered sign up box
        - The sign up box contains full name, email address, team, password, confirm password and optional photo id field
        - In the lower section of sign up box contains "Create Account" button
        - Directly below sign up box includes "Already have an account? Log in"