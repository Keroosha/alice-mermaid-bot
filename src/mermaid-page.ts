export const createMermaidPage = (chart: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
</head>
<body>
    <div class="mermaid">
        ${chart}
    </div>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <script>
        mermaid.initialize({startOnLoad:true});
        window.addEventListener("DOMContentLoaded", () => {
            window.dispatchEvent(new Event("mermaid-ready"));
        });
    </script>
</body>
</html>
`;
