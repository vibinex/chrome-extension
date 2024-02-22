// Mapping of keys to their respective labels.
const keyToLabel = Object.freeze({
	'relevant': "Relevant",
	'important': "Important"
});

// Background color for relevant GitHub items.
const GH_RELEVANT_BG_COLOR = "rgb(86, 88, 0)";

/**
 * Highlights relevant pull requests on GitHub based on provided IDs.
 * 
 * @param {Object} highlightedPRIds - Object containing PR IDs to be highlighted.
 */
function highlightRelevantPRs(highlightedPRIds) {
	if (highlightedPRIds) {
		for (const priorityLevel in highlightedPRIds) {
			for (const prNumber in highlightedPRIds[priorityLevel]) {
				addingCssElementToGithub(prNumber, keyToLabel[priorityLevel], highlightedPRIds[priorityLevel][prNumber]);
			}
		}
	}
};

/**
 * Adds CSS styling to GitHub elements based on their relevance or importance.
 * 
 * @param {string} elementId - The ID of the GitHub element.
 * @param {string} status - The status (e.g., "Relevant" or "Important").
 * @param {Object} changeInfo - Information about the changes.
 */
function addingCssElementToGithub(elementId, status, changeInfo) {
	const backgroundColor = status == 'Important' ? 'rgb(61, 0, 0)' : GH_RELEVANT_BG_COLOR;
	const tagBackgroundColor = status == 'Important' ? 'rgb(255,0,0)' : 'rgb(164, 167, 0)';
	const rowElement = document.getElementById(`issue_${elementId}`);
	if (rowElement && rowElement != null) {
		rowElement.style.backgroundColor = backgroundColor;
		const element = document.head.appendChild(document.createElement("style"));
		// TODO: a better approach would be create a constant CSS for a class, and add the class to the elements in consideration
		element.innerHTML = `#issue_${elementId}_link::before{
		background-color:${tagBackgroundColor};
		content: '${changeInfo['num_hunks_changed']} change${parseInt(changeInfo['num_hunks_changed']) == 1 ? '' : 's'}';
		color: white;
		width: 12px;
		height: 12px;
		border: rgb(45, 0, 0);
		border-radius: 5px;
		margin-right: 10px;
		padding-left: 5px;
		padding-right: 5px;
		padding-bottom: 2px;}`;
	}
};

/**
 * Adds CSS styling to Bitbucket elements based on their relevance or importance.
 * 
 * @param {Object} highlightedPRIds - Object containing PR IDs to be highlighted.
 */
function addCssElementToBitbucket(highlightedPRIds) {
	const tables = document.getElementsByTagName('table')[0];
	const allLinks = Array.from(tables.getElementsByTagName('a'));

	function changingCss(id, status, changeInfo) {
		const backgroundColor = status == 'Important' ? 'rgb(255, 186, 181)' : 'rgb(241, 245, 73)';
		const tagBackgroundColor = status == 'Important' ? 'rgb(232, 15, 0)' : 'rgb(164, 167, 0)';
		allLinks.forEach((item) => {
			const link = item.getAttribute('href').split('/');
			const prId = link[link.length - 1]; // getting the last element from url which is pr id. 
			if (prId == id) {
				const beforePsuedoElement = document.createElement('span');
				beforePsuedoElement.innerText = `${status} (${changeInfo['num_hunks_changed']})`;
				beforePsuedoElement.style.display = 'inline-block';
				beforePsuedoElement.style.marginRight = '5px';
				beforePsuedoElement.style.backgroundColor = `${tagBackgroundColor}`;
				beforePsuedoElement.style.color = 'white';
				beforePsuedoElement.style.padding = '2px';
				beforePsuedoElement.style.paddingLeft = '5px';
				beforePsuedoElement.style.paddingRight = '5px';
				beforePsuedoElement.style.borderRadius = '3px';
				const parent = item.closest('tr');
				parent.style.backgroundColor = `${backgroundColor}`;
				parent.style.borderRadius = '2px';
				item.insertBefore(beforePsuedoElement, item.firstChild);
			};
		});
	}
	for (const priorityLevel in highlightedPRIds) {
		for (const prNumber in highlightedPRIds[priorityLevel]) {
			changingCss(prNumber, keyToLabel[priorityLevel], highlightedPRIds[priorityLevel][prNumber]);
		}
	}
}

/**
 * Highlights important files in a GitHub pull request.
 * 
 * @param {Object} response - Response object containing relevant data.
 */
async function showImpFileInPr(response) {
	if ("files" in response) {
		const encryptedFileNames = new Set(response['files']);
		const fileNav = document.querySelector('[aria-label="File Tree Navigation"]');
		if (!fileNav) return;
		const fileList = Array.from(fileNav.getElementsByTagName('li'));

		for (const item of fileList) {
			const elements = item.getElementsByClassName('ActionList-item-label');
			if (elements.length === 1) {
				let filename = elements[0].innerHTML.trim();
				let element = elements[0];
				let anc = element.closest("ul");
				while (anc !== null) {
					for (const child of anc.parentElement.childNodes) {
						if (child.nodeName.toLowerCase() === "button") {
							let folders = child.getElementsByClassName('ActionList-item-label');
							if (folders.length === 1) {
								const folderName = folders[0].innerHTML.trim();
								filename = `${folderName}/${filename}`;
							}
						}
					}
					element = anc.parentElement;
					anc = element.closest("ul");
				}
				const hashedFilename = await sha256(filename);
				if (encryptedFileNames.has(hashedFilename)) {
					item.style.backgroundColor = '#7a7e00';
				}
			}
		}
	}
}

/**
 * Highlights important files in a Bitbucket pull request.
 * 
 * @param {Object} response - Response object containing relevant data.
 */
async function FilesInPrBitbucket(response) {
	let lastKnownScrollPosition = 0;
	let currentScrollPosition = 0;
	let ticking = false;
	document.addEventListener('scroll', () => {
		currentScrollPosition = window.scrollY;
		if (!ticking) {
			window.requestAnimationFrame(() => {
				if (currentScrollPosition - lastKnownScrollPosition > 100) {
					if ("files" in response) {
						const encryptedFileNames = new Set(response['files']);
						const fileNav = Array.from(document.querySelectorAll("[aria-label^='Diff of file']"));
						lastKnownScrollPosition = currentScrollPosition;
						fileNav.forEach(async (element) => {
							const h3Element = element.querySelector('h3');
							const spanElement = Array.from(h3Element.querySelectorAll('span'));
							const elementHeading = spanElement.length == 1 ? spanElement[0] : spanElement[spanElement.length - 1];
							const spanText = elementHeading.textContent;

							const hashFileName = await sha256(spanText);
							if (encryptedFileNames.has(hashFileName)) {
								if (spanElement.length == 1) {
									const changeBgColor = element.getElementsByClassName('css-10sfmq2')[0];
									changeBgColor.style.backgroundColor = '#c5cc02';
								} else {
									const value = elementHeading.parentNode.parentNode.parentNode.parentNode.parentNode;
									const value2 = value.children[0];
									value2.style.backgroundColor = '#c5cc02';
								}
							}
						});
					}
				}
				ticking = false;
			});
			ticking = true;
		}
	});
}

/**
 * Highlights specific hunks (sections) of code in a GitHub pull request.
 * 
 * @param {Array} apiResponses - Array of API responses containing hunk information.
 */
const githubHunkHighlight = async (apiResponses) => {
	// checking for diff view either unified or split
	let isUnifiedDiffView = false;
	const allInputTagsWithValueAttr = document.querySelectorAll('input[value]'); // for reducing DOM queries in foreach loop.
	for (const item of allInputTagsWithValueAttr) {
		const valueAttrOfInputTag = item.getAttribute('value');
		const checkedAttrOfInputTag = item.getAttribute('checked');

		if (valueAttrOfInputTag === 'unified' || valueAttrOfInputTag === 'split') {
			if (checkedAttrOfInputTag === 'checked' && valueAttrOfInputTag === 'unified') {
				isUnifiedDiffView = true; // for unified view
			}
		}
	};

	// TODO: optimization needed to not highlight next deleted line space if not present in response.
	const allFileDiffViews = Array.from(document.querySelectorAll('div[data-tagsearch-path]'));
	allFileDiffViews.forEach(async (fileDiffView) => {
		let filepathFromHTML = fileDiffView.getAttribute('data-tagsearch-path');
		if (!filepathFromHTML) {
			console.error(`[vibinex] File address not found in HTML for file: ${filepathFromHTML}`);
			return;
		}

		const encryptedFilepathFromHTML = await sha256(filepathFromHTML);
		const relevantHunksInThisFile = apiResponses["hunkinfo"].filter(hunkInfo => hunkInfo.filepath === encryptedFilepathFromHTML);

		if (relevantHunksInThisFile.length <= 0) {
			console.debug(`[vibinex] No relevant hunks in file: ${filepathFromHTML}`);
			return;
		}

		/** Select all TRs except the following:
		 * - TRs with the .js-skip-tagsearch are the rows which are expandable (we click on it to see more code)
		 * - TRs inside the THEAD[hidden] tags only contain the headings of the diff table
		 */
		const allRowsInFileDiff = Array.from(fileDiffView.querySelectorAll('tr:not(.js-skip-tagsearch):not(thead[hidden] :is(tr))'));
		if (isUnifiedDiffView) { // for unified view
			const isRelevantRow = (row) => {
				const lineContentSpan = row.querySelector('span[data-code-marker]');
				if (!lineContentSpan) {
					console.warn(`[vibinex] Could not detect span with data-code-marker in diff row for file: ${filepathFromHTML}`);
					return false;
				}
				const signature = lineContentSpan.getAttribute('data-code-marker');

				const cellInRowWithLineNumber = row.querySelector('td[data-line-number]');
				if (!cellInRowWithLineNumber) {
					console.warn(`[vibinex] Could not detect cell with data-line-number in diff row for file: ${filepathFromHTML}`);
					return false;
				}
				const lineNumber = cellInRowWithLineNumber.getAttribute('data-line-number');
				for (const hunk of relevantHunksInThisFile) {
					if ((signature === '-') && (parseInt(lineNumber) >= parseInt(hunk.line_start)) && (parseInt(lineNumber) <= parseInt(hunk.line_end))) {
						return true;
					}
				}
				return false;
			};
			allRowsInFileDiff.forEach((rowInFileDiff) => {
				if (isRelevantRow(rowInFileDiff)) {
					rowInFileDiff.style.backgroundColor = GH_RELEVANT_BG_COLOR;
				}
			});
		} else { // for split view 
			allRowsInFileDiff.forEach((rowInFileDiff) => {
				if (rowInFileDiff.classList.contains('blob-expanded')) {
					return; // this row is not considered part of the diff
				}
				const leftSideContentCell = rowInFileDiff.querySelector("td[data-split-side='left']");
				if (!leftSideContentCell) {
					console.warn(`[vibinex] Could not detect left side content cell in diff row`);
					return; // this row doesn't have left side content cell
				}
				const addCommentButtonWithLineNo = leftSideContentCell.querySelector('button[data-line]');
				if (!addCommentButtonWithLineNo) {
					console.error('[vibinex] Could not detect line number in diff row');
					return; // this cell doesn't have 'add comment' button
				}
				const lineNumber = addCommentButtonWithLineNo.getAttribute('data-line');

				if (leftSideContentCell?.querySelector("span[data-code-marker='-']")) {
					for (const hunk of relevantHunksInThisFile) {
						if (parseInt(lineNumber) >= parseInt(hunk.line_start) && parseInt(lineNumber) <= parseInt(hunk.line_end)) {
							leftSideContentCell.style.backgroundColor = GH_RELEVANT_BG_COLOR;
						}
					}
				}
				// we currently do not handle any other cases
			});
		}
	});
};

/**
 * Highlights specific hunks (sections) of code in a Bitbucket pull request.
 * 
 * @param {Array} apiResponses - Array of API responses containing hunk information.
 */
const bitBucketHunkHighlight = (apiResponses) => {
	let lastKnownScrollPosition = 0;
	let currentScrollPosition = 0;
	let ticking = false;
	document.addEventListener('scroll', () => {
		currentScrollPosition = window.scrollY;
		if (!ticking) {
			window.requestAnimationFrame(() => {
				if (currentScrollPosition - lastKnownScrollPosition > 100) {

					const articles = document.querySelectorAll('article[aria-label^="Diff of file"]');
					articles.forEach(async (article) => {
						const ariaLabel = article.getAttribute('aria-label');
						const fileName = ariaLabel.substring(13); // beacuse ariaLable = "Diff of file testFile.js", so removing first 13 letters to get the file name

						const matchEncrypted = await sha256(fileName);
						const foundFiles = apiResponses["hunkinfo"].find(item => item.filepath === matchEncrypted);

						if (foundFiles) {
							const fileHighlight = article.firstElementChild;
							const headingHighlight = fileHighlight.children[0];
							headingHighlight.style.backgroundColor = '#f1f549'; // highlight file Head

							// getting the status of file 
							const status = article.querySelector('div[class^="diff-chunk-inner"]');
							const statusDetail = status.classList;

							const listOfChunks = article.getElementsByClassName('diff-chunk-inner');
							const allChunkLines = Array.from(listOfChunks).map(chunk => Array.from(chunk.querySelectorAll('.lines-wrapper')));

							const lineStart = parseInt(foundFiles.line_start);
							const lineEnd = parseInt(foundFiles.line_end);

							function getLineNumber(element) {
								const lineNumberElement = element.querySelector('a[aria-label]');
								const getLineNumber = lineNumberElement.getAttribute('aria-label');
								const lineNumber = parseInt(getLineNumber.match(/\d+/)[0]); // for getting the number from text (for example : 'xyz abc 12' gives 12)
								return lineNumber;
							}

							if (statusDetail[1] == 'side-by-side') {
								// for split view 
								allChunkLines.forEach((item) => {
									const scanEachLine = item.querySelectorAll('span[data-line-type]');

									scanEachLine.forEach((line) => {
										const symbol = line.getAttribute('data-line-type');

										if (symbol == '-') {
											const lineNumber = getLineNumber(item);
											if (lineNumber >= lineStart && lineNumber <= lineEnd) {
												const firstElement = item.firstElementChild;
												const secondChild = firstElement.children[2];
												secondChild.style.borderLeft = 'solid 6px #eaee32';
											}
										} else if (symbol == '+') {
											const lineNumber = getLineNumber(item);
											if (lineNumber >= lineStart && lineNumber <= lineEnd) {
												const secondElement = item.children[1];
												const secondChild = secondElement.children[2];
												secondChild.style.borderLeft = 'solid 6px #f1f549';
											}
										}
									});

								});

							} else {
								// for unified view 
								allChunkLines.forEach((item) => {
									const eachLine = item.querySelector('span[data-line-type]');
									const symbol = eachLine.getAttribute('data-line-type');

									if (symbol == '-' || symbol == '+') {
										const lineNumber = getLineNumber(item);
										if (lineNumber >= lineStart && lineNumber <= lineEnd && symbol == '-') {
											const firstElement = item.firstElementChild;
											const secondChild = firstElement.children[2];
											secondChild.style.borderLeft = 'solid 6px #eaee32';
										}
									}
								});
							}
						}
					});
				}
				ticking = false;
			});
			ticking = true;
		}
	});
};