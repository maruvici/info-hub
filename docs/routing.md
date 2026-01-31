```mermaid
graph TD
    subgraph Routes
        R1[/] -->|Auth Check| R2[/dashboard]
        R1 -->|Login Click| R3[/login]
        R2 -->|Search| R2
        R2 -->|Click Post| R4[/post/:id]
        R2 -->|Click Profile| R5[/user/:id]
    end

    subgraph Component_Logic
        Dashboard -->|State| Sorting[Most Recent/Liked/Views]
        Dashboard -->|State| Filtering[PostType/Tags]
        PostPage -->|Recursive| Comments[Nested Tree]
        UserPage -->|Conditional| Tabs[Details/Posts/Settings]
    end
```