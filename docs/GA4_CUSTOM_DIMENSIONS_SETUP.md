# Google Analytics 4 Custom Dimensions Setup Guide

## Overview

This guide will help you set up custom dimensions in GA4 to track blog-specific metrics like shares, audio plays, and likes per blog post.

## 🎯 Custom Dimensions to Create

You need to create these custom dimensions in your GA4 property:

| Dimension Name | Scope | Description | Parameter Name |
|---------------|-------|-------------|----------------|
| Blog ID | Event | Unique identifier for blog posts | `blog_id` |
| Blog Title | Event | Title of the blog post | `blog_title` |
| Blog Category | Event | Category of the blog post | `blog_category` |
| Share Platform | Event | Platform where content was shared | `platform` |
| Content Category | Event | Type of content being tracked | `content_category` |

## 📋 Step-by-Step Setup

### Step 1: Access GA4 Admin Panel

1. Go to [Google Analytics](https://analytics.google.com)
2. Select your property
3. Click **Admin** (gear icon) in the bottom left
4. In the **Property** column, click **Custom definitions**

### Step 2: Create Custom Dimensions

For each dimension, follow these steps:

#### A. Blog ID (Most Important)

1. Click **Create custom dimensions**
2. Fill in the details:
   - **Dimension name**: `Blog ID`
   - **Scope**: `Event`
   - **Description**: `Unique identifier for blog posts`
   - **Event parameter**: `blog_id`
   - **Format**: `Standard`
3. Click **Save**

#### B. Blog Title

1. Click **Create custom dimensions**
2. Fill in:
   - **Dimension name**: `Blog Title`
   - **Scope**: `Event`
   - **Description**: `Title of the blog post`
   - **Event parameter**: `blog_title`
   - **Format**: `Standard`
3. Click **Save**

#### C. Blog Category

1. Click **Create custom dimensions**
2. Fill in:
   - **Dimension name**: `Blog Category`
   - **Scope**: `Event`
   - **Description**: `Category of the blog post`
   - **Event parameter**: `blog_category`
   - **Format**: `Standard`
3. Click **Save**

#### D. Share Platform

1. Click **Create custom dimensions**
2. Fill in:
   - **Dimension name**: `Share Platform`
   - **Scope**: `Event`
   - **Description**: `Platform where content was shared (Twitter, Facebook, etc.)`
   - **Event parameter**: `platform`
   - **Format**: `Standard`
3. Click **Save**

#### E. Content Category

1. Click **Create custom dimensions**
2. Fill in:
   - **Dimension name**: `Content Category`
   - **Scope**: `Event`
   - **Description**: `Type of content (Blog, Home, Generate, etc.)`
   - **Event parameter**: `content_category`
   - **Format**: `Standard`
3. Click **Save**

### Step 3: Wait for Data Collection

- Custom dimensions start collecting data **immediately** after creation
- Historical data is **not** retroactively populated
- You'll see data in reports within **24-48 hours**

### Step 4: Verify Setup

1. Go to **Reports** → **Engagement** → **Events**
2. Click on an event like `blog_like` or `blog_share`
3. You should see your custom dimensions in the dimension dropdown

## 🔍 Testing Custom Dimensions

### Using GA4 DebugView

1. **Enable Debug Mode** in your browser:
   ```javascript
   // Already configured in analytics.ts with VITE_GA_DEBUG_MODE
   ```

2. **Access DebugView**:
   - In GA4, go to **Admin** → **DebugView**
   - Or go to **Configure** → **DebugView**

3. **Trigger Events**:
   - Like a blog post
   - Share a blog post
   - Play audio narration

4. **Verify Parameters**:
   - Click on the event in DebugView
   - Check that `blog_id`, `blog_title`, etc. are present
   - Verify values are correct

### Using Browser Console

Enable debug mode and check console logs:

```bash
# In your .env file
VITE_GA_DEBUG_MODE=true
```

Then check browser console for tracking logs.

## 📊 Custom Dimensions in Reports

### Creating Custom Reports

1. **Go to Explore**:
   - Click **Explore** in the left sidebar
   - Click **Blank** to create new exploration

2. **Add Dimensions**:
   - In Dimensions, click **+**
   - Search for your custom dimensions
   - Add: Blog ID, Blog Title, Blog Category, Share Platform

3. **Add Metrics**:
   - Event count
   - Total users
   - Engaged sessions

4. **Create Visualizations**:
   - Table: Top blogs by likes/shares
   - Bar chart: Shares by platform
   - Line chart: Blog engagement over time

### Example Reports to Create

#### 1. Top Performing Blogs
- **Rows**: Blog Title
- **Columns**: Event count
- **Filters**: Event name = blog_like OR blog_share
- **Sort**: Event count (descending)

#### 2. Share Platform Distribution
- **Rows**: Share Platform
- **Columns**: Event count
- **Filters**: Event name = blog_share
- **Visualization**: Pie chart

#### 3. Blog Category Performance
- **Rows**: Blog Category
- **Columns**: Event count, Total users
- **Filters**: Event name contains "blog_"
- **Visualization**: Bar chart

## 📝 Custom Dimension Reference

### Event Parameters Being Sent

From frontend `analytics.ts`:

## Event Parameter Reference

The frontend tracking code sends the following custom parameters with each event:

### Blog Events
| Event Name | Parameters Sent |
|-----------|----------------|
| `blog_view` | `blog_id`, `blog_title`, `blog_category`, `content_type` |
| `blog_like` | `blog_id`, `blog_title`, `blog_category`, `engagement_type` |
| `blog_dislike` | `blog_id`, `blog_title`, `blog_category`, `engagement_type` |
| `blog_comment` | `blog_id`, `blog_title`, `blog_category`, `engagement_type` |
| `blog_share` | `blog_id`, `blog_title`, `blog_category`, `platform`, `content_type` |

### Audio Events
| Event Name | Parameters Sent |
|-----------|----------------|
| `audio_play` | `blog_id`, `blog_title`, `blog_category`, `content_type` |
| `audio_generate` | `blog_id`, `blog_title`, `blog_category`, `action_type` |
| `audio_complete` | `blog_id`, `blog_title`, `blog_category`, `duration`, `engagement_type` |

### Other Events
| Event Name | Parameters Sent |
|-----------|----------------|
| `search` | `search_term`, `results_count` |
| `view_item_list` | `item_list_name`, `item_category` |
| `sign_up` | `method` |
| `login` | `method` |

