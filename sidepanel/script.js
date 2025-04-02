// Initialize Mermaid with custom theme
mermaid.initialize({
	theme: 'neutral',
	themeVariables: {
		fontSize: '14px',
		fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
	},
	flowchart: {
		nodeSpacing: 100,
		rankSpacing: 100,
		curve: 'basis'
	}
});

// Function to render the flowchart
function renderFlowchart(graphData) {
	const mermaidDiv = document.querySelector('.mermaid');
	mermaidDiv.innerHTML = graphData;
	mermaid.init(undefined, mermaidDiv);
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === 'UPDATE_FLOWCHART') {
		renderFlowchart(message.graphData);
	}
});

// Example flowchart data (for testing)
const exampleGraph = `
    flowchart LR
        subgraph src [src]
            A[function1]:::added
            B[function2]:::deleted
            C[function3]:::modified
        end
        subgraph test [test]
            D[test1]:::added
            E[test2]:::deleted
        end
        A --> D
        B --> E
        C --> D
`;

// Render example graph on load (for testing)
renderFlowchart(exampleGraph);
