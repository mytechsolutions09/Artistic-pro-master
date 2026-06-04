-- =====================================================
-- COMPLETE SUPABASE TASKS MANAGEMENT SYSTEM
-- Copy and paste this entire script into Supabase SQL Editor
-- =====================================================

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'inprogress', 'review', 'completed')),
    due_date DATE,
    assignee VARCHAR(100),
    avatar VARCHAR(10), -- For storing initials like 'BS', 'MT'
    tags JSONB DEFAULT '[]', -- Store tags as JSON array
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    comments INTEGER DEFAULT 0,
    attachments INTEGER DEFAULT 0,
    color VARCHAR(20) DEFAULT 'blue' CHECK (color IN ('blue', 'orange', 'green', 'purple', 'pink', 'red')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Task Categories/Projects Table
CREATE TABLE IF NOT EXISTS task_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(20) DEFAULT 'blue',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Team Members/Assignees Table
CREATE TABLE IF NOT EXISTS team_members (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    avatar VARCHAR(10), -- Initials
    role VARCHAR(50),
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Labels/Tags Management Table
CREATE TABLE IF NOT EXISTS task_labels (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(20) DEFAULT 'gray',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Templates for Quick Creation
CREATE TABLE IF NOT EXISTS task_templates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    title_template VARCHAR(255),
    description_template TEXT,
    default_priority VARCHAR(20) DEFAULT 'normal',
    default_assignee_id BIGINT REFERENCES team_members(id),
    default_tags JSONB DEFAULT '[]',
    estimated_hours INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Task Comments Table
CREATE TABLE IF NOT EXISTS task_comments (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Task Attachments Table
CREATE TABLE IF NOT EXISTS task_attachments (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add category and template references to main tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category_id BIGINT REFERENCES task_categories(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS template_id BIGINT REFERENCES task_templates(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_hours INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS actual_hours INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON tasks USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON tasks(category_id);
CREATE INDEX IF NOT EXISTS idx_tasks_template_id ON tasks(template_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status_priority ON tasks(status, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_status ON tasks(assignee, status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date_status ON tasks(due_date, status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at_desc ON tasks(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tasks (drop if exists first)
DROP POLICY IF EXISTS "Allow authenticated users to read tasks" ON tasks;
CREATE POLICY "Allow authenticated users to read tasks" ON tasks
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to create tasks" ON tasks;
CREATE POLICY "Allow authenticated users to create tasks" ON tasks
    FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow authenticated users to update tasks" ON tasks;
CREATE POLICY "Allow authenticated users to update tasks" ON tasks
    FOR UPDATE TO authenticated USING (true) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow authenticated users to delete tasks" ON tasks;
CREATE POLICY "Allow authenticated users to delete tasks" ON tasks
    FOR DELETE TO authenticated USING (true);

-- Create RLS policies for other tables (drop if exists first)
DROP POLICY IF EXISTS "Allow authenticated users to read categories" ON task_categories;
CREATE POLICY "Allow authenticated users to read categories" ON task_categories
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to create categories" ON task_categories;
CREATE POLICY "Allow authenticated users to create categories" ON task_categories
    FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow authenticated users to read team_members" ON team_members;
CREATE POLICY "Allow authenticated users to read team_members" ON team_members
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to create team_members" ON team_members;
CREATE POLICY "Allow authenticated users to create team_members" ON team_members
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to read labels" ON task_labels;
CREATE POLICY "Allow authenticated users to read labels" ON task_labels
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to create labels" ON task_labels;
CREATE POLICY "Allow authenticated users to create labels" ON task_labels
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to read templates" ON task_templates;
CREATE POLICY "Allow authenticated users to read templates" ON task_templates
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to create templates" ON task_templates;
CREATE POLICY "Allow authenticated users to create templates" ON task_templates
    FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow authenticated users to read comments" ON task_comments;
CREATE POLICY "Allow authenticated users to read comments" ON task_comments
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to create comments" ON task_comments;
CREATE POLICY "Allow authenticated users to create comments" ON task_comments
    FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow authenticated users to read attachments" ON task_attachments;
CREATE POLICY "Allow authenticated users to read attachments" ON task_attachments
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to create attachments" ON task_attachments;
CREATE POLICY "Allow authenticated users to create attachments" ON task_attachments
    FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- View for task statistics
CREATE OR REPLACE VIEW task_stats AS
SELECT 
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN status = 'todo' THEN 1 END) as todo_count,
    COUNT(CASE WHEN status = 'inprogress' THEN 1 END) as inprogress_count,
    COUNT(CASE WHEN status = 'review' THEN 1 END) as review_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
    COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_count,
    COUNT(CASE WHEN priority = 'important' THEN 1 END) as important_count,
    COUNT(CASE WHEN due_date < CURRENT_DATE AND status != 'completed' THEN 1 END) as overdue_count,
    AVG(progress) as avg_progress,
    COUNT(CASE WHEN assignee IS NOT NULL THEN 1 END) as assigned_count,
    COUNT(CASE WHEN assignee IS NULL THEN 1 END) as unassigned_count
FROM tasks;

-- Function for advanced task filtering
CREATE OR REPLACE FUNCTION filter_tasks(
    p_status TEXT DEFAULT NULL,
    p_priority TEXT DEFAULT NULL,
    p_assignee TEXT DEFAULT NULL,
    p_category_id BIGINT DEFAULT NULL,
    p_tags JSONB DEFAULT NULL,
    p_search TEXT DEFAULT NULL,
    p_due_date_from DATE DEFAULT NULL,
    p_due_date_to DATE DEFAULT NULL,
    p_overdue_only BOOLEAN DEFAULT FALSE,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id BIGINT,
    title VARCHAR(255),
    description TEXT,
    priority VARCHAR(20),
    status VARCHAR(20),
    due_date DATE,
    assignee VARCHAR(100),
    avatar VARCHAR(10),
    tags JSONB,
    progress INTEGER,
    comments INTEGER,
    attachments INTEGER,
    color VARCHAR(20),
    category_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    is_overdue BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.title,
        t.description,
        t.priority,
        t.status,
        t.due_date,
        t.assignee,
        t.avatar,
        t.tags,
        t.progress,
        t.comments,
        t.attachments,
        t.color,
        tc.name as category_name,
        t.created_at,
        t.updated_at,
        (t.due_date < CURRENT_DATE AND t.status != 'completed') as is_overdue
    FROM tasks t
    LEFT JOIN task_categories tc ON t.category_id = tc.id
    WHERE 
        (p_status IS NULL OR t.status = p_status) AND
        (p_priority IS NULL OR t.priority = p_priority) AND
        (p_assignee IS NULL OR t.assignee ILIKE '%' || p_assignee || '%') AND
        (p_category_id IS NULL OR t.category_id = p_category_id) AND
        (p_tags IS NULL OR t.tags @> p_tags) AND
        (p_search IS NULL OR 
         t.title ILIKE '%' || p_search || '%' OR 
         t.description ILIKE '%' || p_search || '%' OR
         t.assignee ILIKE '%' || p_search || '%') AND
        (p_due_date_from IS NULL OR t.due_date >= p_due_date_from) AND
        (p_due_date_to IS NULL OR t.due_date <= p_due_date_to) AND
        (p_overdue_only = FALSE OR (t.due_date < CURRENT_DATE AND t.status != 'completed'))
    ORDER BY 
        CASE WHEN t.priority = 'urgent' THEN 1
             WHEN t.priority = 'important' THEN 2
             ELSE 3 END,
        t.due_date ASC NULLS LAST,
        t.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to get filter options
CREATE OR REPLACE FUNCTION get_filter_options()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'assignees', (
            SELECT json_agg(DISTINCT assignee ORDER BY assignee)
            FROM tasks 
            WHERE assignee IS NOT NULL
        ),
        'categories', (
            SELECT json_agg(json_build_object('id', id, 'name', name, 'color', color))
            FROM task_categories
            ORDER BY name
        ),
        'tags', (
            SELECT json_agg(DISTINCT tag ORDER BY tag)
            FROM (
                SELECT jsonb_array_elements_text(tags) as tag
                FROM tasks
                WHERE tags IS NOT NULL
            ) as all_tags
        ),
        'priorities', json_build_array('normal', 'important', 'urgent'),
        'statuses', json_build_array('todo', 'inprogress', 'review', 'completed')
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to create task with auto-generated fields
CREATE OR REPLACE FUNCTION create_task(
    p_title VARCHAR(255),
    p_description TEXT DEFAULT NULL,
    p_priority VARCHAR(20) DEFAULT 'normal',
    p_status VARCHAR(20) DEFAULT 'todo',
    p_due_date DATE DEFAULT NULL,
    p_assignee VARCHAR(100) DEFAULT NULL,
    p_tags JSONB DEFAULT '[]',
    p_category_id BIGINT DEFAULT NULL,
    p_template_id BIGINT DEFAULT NULL,
    p_color VARCHAR(20) DEFAULT 'blue',
    p_estimated_hours INTEGER DEFAULT 0
)
RETURNS BIGINT AS $$
DECLARE
    new_task_id BIGINT;
    assignee_avatar VARCHAR(10);
BEGIN
    -- Generate avatar from assignee name
    IF p_assignee IS NOT NULL THEN
        SELECT string_agg(substring(word, 1, 1), '')
        INTO assignee_avatar
        FROM (
            SELECT unnest(string_to_array(p_assignee, ' ')) as word
        ) words
        LIMIT 2;
        
        assignee_avatar := UPPER(assignee_avatar);
    END IF;
    
    -- Insert the new task
    INSERT INTO tasks (
        title, 
        description, 
        priority, 
        status, 
        due_date, 
        assignee, 
        avatar,
        tags, 
        category_id,
        template_id,
        color,
        estimated_hours,
        created_by,
        updated_by
    ) VALUES (
        p_title,
        p_description,
        p_priority,
        p_status,
        p_due_date,
        p_assignee,
        assignee_avatar,
        p_tags,
        p_category_id,
        p_template_id,
        p_color,
        p_estimated_hours,
        auth.uid(),
        auth.uid()
    ) RETURNING id INTO new_task_id;
    
    RETURN new_task_id;
END;
$$ LANGUAGE plpgsql;

-- Function to duplicate/clone a task
CREATE OR REPLACE FUNCTION clone_task(p_task_id BIGINT)
RETURNS BIGINT AS $$
DECLARE
    new_task_id BIGINT;
    original_task RECORD;
BEGIN
    -- Get original task data
    SELECT * INTO original_task FROM tasks WHERE id = p_task_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Task with id % not found', p_task_id;
    END IF;
    
    -- Create new task with copied data
    INSERT INTO tasks (
        title, 
        description, 
        priority, 
        status, 
        assignee, 
        avatar,
        tags, 
        category_id,
        color,
        estimated_hours,
        created_by,
        updated_by
    ) VALUES (
        'Copy of ' || original_task.title,
        original_task.description,
        original_task.priority,
        'todo', -- Reset status
        original_task.assignee,
        original_task.avatar,
        original_task.tags,
        original_task.category_id,
        original_task.color,
        original_task.estimated_hours,
        auth.uid(),
        auth.uid()
    ) RETURNING id INTO new_task_id;
    
    RETURN new_task_id;
END;
$$ LANGUAGE plpgsql;

-- Insert sample categories
INSERT INTO task_categories (name, description, color) 
SELECT * FROM (VALUES
('Frontend Development', 'UI/UX and frontend related tasks', 'blue'),
('Backend Development', 'API and server-side tasks', 'green'),
('Design', 'UI/UX design and prototyping', 'purple'),
('Marketing', 'Marketing and promotional tasks', 'orange'),
('Research', 'Research and analysis tasks', 'pink'),
('Testing', 'Quality assurance and testing', 'red')
) AS v(name, description, color)
WHERE NOT EXISTS (SELECT 1 FROM task_categories WHERE task_categories.name = v.name);

-- Insert sample team members
INSERT INTO team_members (name, email, avatar, role, department) 
SELECT * FROM (VALUES
('Brooklyn Simmons', 'brooklyn@company.com', 'BS', 'Frontend Developer', 'Development'),
('Marketing Team', 'marketing@company.com', 'MT', 'Marketing Manager', 'Marketing'),
('Development Team', 'dev@company.com', 'DT', 'Lead Developer', 'Development'),
('Design Team', 'design@company.com', 'DT', 'UI/UX Designer', 'Design'),
('Full Stack Team', 'fullstack@company.com', 'FS', 'Full Stack Developer', 'Development'),
('UI/UX Team', 'ux@company.com', 'UX', 'UX Researcher', 'Design'),
('Web Design Team', 'webdesign@company.com', 'WD', 'Web Designer', 'Design'),
('Mobile Team', 'mobile@company.com', 'MT', 'Mobile Developer', 'Development'),
('Backend Team', 'backend@company.com', 'BT', 'Backend Developer', 'Development'),
('Database Team', 'db@company.com', 'DB', 'Database Administrator', 'Development')
) AS v(name, email, avatar, role, department)
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE team_members.email = v.email);

-- Insert sample task labels
INSERT INTO task_labels (name, color, description) 
SELECT * FROM (VALUES
('Research', 'blue', 'Research and analysis tasks'),
('Website', 'green', 'Website development tasks'),
('Questionnaire', 'orange', 'Survey and questionnaire tasks'),
('UX', 'purple', 'User experience related tasks'),
('Milestone', 'red', 'Important milestone tasks'),
('Launch', 'pink', 'Product launch tasks'),
('Design', 'purple', 'Design and creative tasks'),
('Landing Page', 'blue', 'Landing page development'),
('Video Call', 'green', 'Video calling features'),
('Development', 'blue', 'General development tasks'),
('Prototype', 'orange', 'Prototyping tasks'),
('Figma', 'purple', 'Figma design tasks'),
('CRM', 'green', 'CRM related tasks'),
('Responsive', 'blue', 'Responsive design tasks'),
('UI', 'purple', 'User interface tasks'),
('Mobile', 'orange', 'Mobile development'),
('API', 'green', 'API development'),
('Payment', 'red', 'Payment system tasks'),
('Integration', 'blue', 'Integration tasks'),
('Database', 'green', 'Database related tasks'),
('Performance', 'orange', 'Performance optimization'),
('Optimization', 'red', 'General optimization tasks')
) AS v(name, color, description)
WHERE NOT EXISTS (SELECT 1 FROM task_labels WHERE task_labels.name = v.name);

-- Insert sample task templates
INSERT INTO task_templates (name, title_template, description_template, default_priority, default_tags, estimated_hours) 
SELECT v.name, v.title_template, v.description_template, v.default_priority, v.default_tags::jsonb, v.estimated_hours
FROM (VALUES
('Bug Fix', 'Fix: [Bug Description]', 'Description of the bug and steps to reproduce:\n\n1. \n2. \n3. \n\nExpected behavior:\nActual behavior:', 'important', '["Bug", "Fix"]', 4),
('Feature Request', 'Feature: [Feature Name]', 'Feature description:\n\nRequirements:\n- \n- \n\nAcceptance criteria:\n- \n- ', 'normal', '["Feature", "Development"]', 8),
('Research Task', 'Research: [Topic]', 'Research objective:\n\nQuestions to answer:\n1. \n2. \n\nDeliverables:\n- ', 'normal', '["Research"]', 6),
('Design Task', 'Design: [Component/Page Name]', 'Design requirements:\n\nTarget audience:\nStyle guide:\nDeliverables:\n- Wireframes\n- Mockups\n- Assets', 'normal', '["Design", "UI"]', 12),
('Code Review', 'Review: [PR/Branch Name]', 'Code review checklist:\n- [ ] Code quality\n- [ ] Performance\n- [ ] Security\n- [ ] Tests\n- [ ] Documentation', 'normal', '["Review", "Code"]', 2)
) AS v(name, title_template, description_template, default_priority, default_tags, estimated_hours)
WHERE NOT EXISTS (SELECT 1 FROM task_templates WHERE task_templates.name = v.name);

-- Insert sample tasks
INSERT INTO tasks (
    title, 
    description, 
    priority, 
    status, 
    due_date, 
    assignee, 
    avatar, 
    tags, 
    progress, 
    comments, 
    attachments, 
    color,
    category_id
) VALUES 
(
    'Research landing page task process pages',
    'Research and analyze the best practices for landing page task process optimization',
    'important',
    'todo',
    '2024-01-15',
    'Brooklyn Simmons',
    'BS',
    '["Research", "Website"]'::jsonb,
    0,
    2,
    1,
    'blue',
    1
),
(
    'How to finish the online questionnaire',
    'Complete the user experience questionnaire for new features',
    'normal',
    'inprogress',
    '2024-01-12',
    'Marketing Team',
    'MT',
    '["Questionnaire", "UX"]'::jsonb,
    65,
    5,
    0,
    'orange',
    4
),
(
    'Milestone project full service launch',
    'Launch the complete service with all features integrated',
    'urgent',
    'inprogress',
    '2024-01-10',
    'Development Team',
    'DT',
    '["Milestone", "Launch"]'::jsonb,
    85,
    12,
    3,
    'green',
    2
),
(
    'Create a landing page task process pages',
    'Design and develop new landing pages for task management',
    'normal',
    'todo',
    '2024-01-08',
    'Design Team',
    'DT',
    '["Design", "Landing Page"]'::jsonb,
    0,
    0,
    2,
    'purple',
    3
),
(
    'Network video call definite web app design and develop',
    'Complete video calling feature integration',
    'normal',
    'review',
    '2024-01-20',
    'Full Stack Team',
    'FS',
    '["Video Call", "Development"]'::jsonb,
    95,
    8,
    1,
    'pink',
    1
),
(
    'Glyph app prototype for OLX optimization in figma',
    'Create app prototype with optimized user experience',
    'normal',
    'review',
    '2024-01-18',
    'UI/UX Team',
    'UX',
    '["Prototype", "Figma"]'::jsonb,
    100,
    3,
    0,
    'blue',
    3
),
(
    'Design CRM shop product page responsive website',
    'Create responsive design for CRM shop product pages',
    'important',
    'completed',
    '2024-01-05',
    'Web Design Team',
    'WD',
    '["CRM", "Responsive", "Design"]'::jsonb,
    100,
    7,
    2,
    'green',
    3
),
(
    'User interface design for mobile application',
    'Design intuitive user interface for mobile app',
    'normal',
    'inprogress',
    '2024-01-25',
    'Mobile Team',
    'MT',
    '["UI", "Mobile", "Design"]'::jsonb,
    45,
    4,
    1,
    'orange',
    1
),
(
    'API integration for payment gateway',
    'Integrate secure payment gateway with existing API',
    'urgent',
    'todo',
    '2024-01-14',
    'Backend Team',
    'BT',
    '["API", "Payment", "Integration"]'::jsonb,
    0,
    1,
    0,
    'red',
    2
),
(
    'Database optimization and performance tuning',
    'Optimize database queries and improve overall performance',
    'important',
    'review',
    '2024-01-22',
    'Database Team',
    'DB',
    '["Database", "Performance", "Optimization"]'::jsonb,
    90,
    6,
    3,
    'purple',
    2
);
