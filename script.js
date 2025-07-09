// DOM elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const categoriesContainer = document.querySelector('.categories-container');
const modalTitle = document.getElementById('modal-title');
const modalSolution = document.getElementById('modal-solution');
const googleSearchInput = document.getElementById('google-search-input');
const googleSearchBtn = document.getElementById('google-search-btn');
const aiSuggestBtn = document.getElementById('ai-suggest-btn');
const searchResultsContainer = document.getElementById('search-results');
let currentProblem = null;

// Initialize modals
const solutionModal = new bootstrap.Modal(document.getElementById('solution-modal'));
const categoryModal = new bootstrap.Modal(document.getElementById('categoryModal'));



// Group problems by category
function groupByCategory(problems) {
    return problems.reduce((acc, problem) => {
        if (!acc[problem.category]) {
            acc[problem.category] = [];
        }
        acc[problem.category].push(problem);
        return acc;
    }, {});
}

// Display categorized problems
function displayCategorizedProblems(problems) {
    const grouped = groupByCategory(problems);
    categoriesContainer.innerHTML = '';
    
    Object.entries(grouped).forEach(([category, items]) => {
        const categorySection = document.createElement('div');
        categorySection.className = 'category-section';
        categorySection.innerHTML = `
            <h2 class="category-title clickable-category" data-category="${category}">
                ${getCategoryName(category)}
            </h2>
            <div class="position-relative">
                <button class="category-nav-btn prev-btn" data-category="${category}">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="problems-row" id="${category}-cards"></div>
                <button class="category-nav-btn next-btn" data-category="${category}">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
        
        categoriesContainer.appendChild(categorySection);
        
        const container = document.getElementById(`${category}-cards`);
        items.forEach((problem, index) => {
            const card = createProblemCard(problem, index);
            container.appendChild(card);
        });
    });
    
    // Add event listeners
    document.querySelectorAll('.clickable-category').forEach(title => {
        title.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            openCategoryModal(category);
        });
    });
    
    document.querySelectorAll('.category-nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            const container = document.getElementById(`${category}-cards`);
            const scrollAmount = container.offsetWidth * 0.8;
            container.scrollBy({ 
                left: this.classList.contains('next-btn') ? scrollAmount : -scrollAmount,
                behavior: 'smooth' 
            });
        });
    });
}

// Create problem card
// Update the createProblemCard function
function createProblemCard(problem, index) {
    const card = document.createElement('div');
    card.className = 'problem-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    card.innerHTML = `
        <div class="card-image-container">
            <img src="${problem.image || 'icons/default-card-image.jpg'}" alt="${problem.title}" class="card-image">
        </div>
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
                <span class="problem-category ${problem.category}">${getCategoryName(problem.category)}</span>
                <small class="problem-date"><i class="far fa-calendar-alt me-1"></i>${problem.date}</small>
            </div>
            <h6 class="card-title problem-title mt-2">${problem.title}</h6>
        </div>
    `;
    
    card.addEventListener('click', () => openSolutionModal(problem));
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View solution for: ${problem.title}`);
    card.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') openSolutionModal(problem);
    });
    
    return card;
}

// Open solution modal with collapsible sections
function openSolutionModal(problem) {
    currentProblem = problem;
    modalTitle.textContent = problem.title;
    
    // Start building the modal content
    let solutionHTML = `
        <div class="d-flex align-items-center mb-4">
            <span class="problem-category ${problem.category} me-2">${getCategoryName(problem.category)}</span>
        </div>
    `;
    
    // Process solution steps (with or without step structure)
    if (problem.solution.includes('<div class="solution-step">')) {
        solutionHTML += problem.solution;
    } else {
        solutionHTML += `
            <div class="solution-step">
                <div class="step-title">Solution</div>
                <div class="step-content">${problem.solution}</div>
            </div>
        `;
    }
    
    // Add resources section if they exist
    if (problem.resources) {
        solutionHTML += `
            <div class="solution-step mt-4">
                <div class="step-title">Additional Resources</div>
                <div class="step-content">
                    <ul class="resource-list">
                        ${problem.resources.map(res => `<li class="resource-item">${res}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
    
    // Insert the HTML into the modal
    modalSolution.innerHTML = solutionHTML;
    solutionModal.show();
    
    // Initialize collapsible sections
    document.querySelectorAll('.solution-step .step-title').forEach(title => {
        title.addEventListener('click', function() {
            this.classList.toggle('collapsed');
            const content = this.nextElementSibling;
            content.classList.toggle('show');
        });
    });
    
    // Initialize all download buttons in step content
    document.querySelectorAll('.step-content .download-button').forEach(container => {
        const fileUrl = container.getAttribute('data-file');
        const buttonName = container.getAttribute('data-name') || 'Download';
        const iconType = fileUrl.endsWith('.pdf') ? 'file-pdf' : 'file-download';
        
        // Create the button element
        container.innerHTML = `
            <button class="step-download-btn">
                <i class="fas fa-${iconType}"></i>
                ${buttonName}
            </button>
        `;
        
        // Add click handler
        container.querySelector('button').addEventListener('click', function() {
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = fileUrl.split('/').pop();
            
            // Visual feedback
            const originalHtml = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
            this.disabled = true;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Reset button after delay
            setTimeout(() => {
                this.innerHTML = originalHtml;
                this.disabled = false;
            }, 1500);
        });
    });
    // Pre-fill Google search
    document.getElementById('google-search-input').value = problem.title;
}

// Open category modal
function openCategoryModal(category) {
    const categoryName = getCategoryName(category);
    document.getElementById('categoryModalTitle').textContent = `${categoryName} Problems`;
    
    const container = document.getElementById('categoryProblemsContainer');
    container.innerHTML = '';
    
    // Filter problems by category
    const categoryProblems = knowledgeBase.filter(problem => problem.category === category);
    
    if (categoryProblems.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-folder-open fa-3x mb-3 text-muted"></i>
                <h4>No problems found in this category</h4>
            </div>
        `;
        return;
    }
    
    // Create cards for each problem in the category
    categoryProblems.forEach(problem => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        
        const card = createProblemCard(problem, 0);
        card.classList.add('category-problem-card');
        card.classList.remove('problem-card');
        
        col.appendChild(card);
        container.appendChild(col);
    });
    
    // Add search functionality for category modal
    const categorySearchInput = document.getElementById('category-search-input');
    const categorySearchBtn = document.getElementById('category-search-btn');
    
    const performCategorySearch = () => {
        const searchTerm = categorySearchInput.value.toLowerCase().trim();
        const cards = container.querySelectorAll('.category-problem-card');
        
        cards.forEach(card => {
            const title = card.querySelector('.problem-title').textContent.toLowerCase();
            const excerpt = card.querySelector('.problem-excerpt').textContent.toLowerCase();
            const matches = title.includes(searchTerm) || excerpt.includes(searchTerm);
            card.style.display = matches ? 'block' : 'none';
            card.parentElement.style.display = matches ? 'block' : 'none';
        });
    };
    
    categorySearchBtn.addEventListener('click', performCategorySearch);
    categorySearchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') performCategorySearch();
    });
    
    categoryModal.show();
}

// Search functionality
function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm === '') {
        displayCategorizedProblems(knowledgeBase);
        return;
    }
    
    const filteredProblems = knowledgeBase.filter(problem => {
        const titleMatch = problem.title.toLowerCase().includes(searchTerm);
        const solutionMatch = problem.solution.toLowerCase().includes(searchTerm);
        const keywordMatch = problem.keywords.some(kw => kw.includes(searchTerm));
        
        return titleMatch || solutionMatch || keywordMatch;
    });
    
    if (filteredProblems.length === 0) {
        categoriesContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-search fa-3x mb-3 text-muted"></i>
                <h3>No results found</h3>
                <p>Try different keywords or browse our categories</p>
            </div>
        `;
    } else {
        displayCategorizedProblems(filteredProblems);
    }
}

// Helper function to get category display name
function getCategoryName(category) {
    const names = {
        'academic': 'Academic',
        'career': 'Career',
        'personal': 'Personal',
        'financial': 'Financial',
        'health': 'Health'
    };
    return names[category] || category;
}

// Google Translate Initialization
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,si,ta',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
}



// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    // Display all problems initially
    displayCategorizedProblems(knowledgeBase);
    
    // Search event listeners
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    // Google search functionality
    googleSearchBtn.addEventListener('click', performGoogleSearch);
    googleSearchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            performGoogleSearch();
        }
    });
    
    // AI suggestion button
aiSuggestBtn.addEventListener('click', getAISuggestions);

function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const category = categorySelect.value;
    
    // Show loading spinner
    problemsContainer.innerHTML = '';
    loadingSpinner.classList.remove('d-none');
    noResults.classList.add('d-none');
    
    // Simulate network delay for better UX
    setTimeout(() => {
        const filteredProblems = knowledgeBase.filter(problem => {
            const matchesSearch = problem.title.toLowerCase().includes(searchTerm) || 
                               problem.keywords.some(kw => kw.includes(searchTerm)) ||
                               problem.solution.toLowerCase().includes(searchTerm);
            const matchesCategory = category === 'all' || problem.category === category;
            
            return matchesSearch && matchesCategory;
        });
        
        displayProblems(filteredProblems);
        loadingSpinner.classList.add('d-none');
        
        if (filteredProblems.length === 0) {
            noResults.classList.remove('d-none');
        }
    }, 500);
    }
    
});

function performGoogleSearch() {
    const query = googleSearchInput.value.trim();
    if (!query) return;
    
    searchResultsContainer.innerHTML = '<div class="text-center py-3"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Searching...</p></div>';
    
    // In a real implementation, you would call a backend service or Google API
    // This is a simulation with mock results
    setTimeout(() => {
        const mockResults = [
            {
                title: `How to solve "${query}" - WikiHow`,
                url: `https://www.wikihow.com/Solve-${query.replace(/\s+/g, '-')}`,
                snippet: `Learn step-by-step methods to solve ${query} with expert advice and community tips.`
            },
            {
                title: `${query} Solutions - WebMD`,
                url: `https://www.webmd.com/search/search_results/default.aspx?query=${encodeURIComponent(query)}`,
                snippet: `Professional advice and solutions for ${query} from medical experts.`
            },
            {
                title: `Best ways to handle ${query} - Reddit`,
                url: `https://www.reddit.com/search/?q=${encodeURIComponent(query)}`,
                snippet: `Community discussions and personal experiences about ${query}.`
            }
        ];
        
        displaySearchResults(mockResults);
    }, 1000);
}

function displaySearchResults(results) {
    searchResultsContainer.innerHTML = '';
    
    if (results.length === 0) {
        searchResultsContainer.innerHTML = '<div class="text-center py-3 text-muted">No results found</div>';
        return;
    }
    
    results.forEach(result => {
        const resultElement = document.createElement('div');
        resultElement.className = 'search-result-item';
        resultElement.innerHTML = `
            <h6><a href="${result.url}" target="_blank">${result.title}</a></h6>
            <p class="small text-muted">${result.snippet}</p>
            <a href="${result.url}" target="_blank" class="small">${new URL(result.url).hostname}</a>
        `;
        searchResultsContainer.appendChild(resultElement);
    });
}

function getAISuggestions() {
    if (!currentProblem) return;
    
    searchResultsContainer.innerHTML = '<div class="text-center py-3"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Getting AI suggestions...</p></div>';
    
    // In a real implementation, you would call an AI API
    // This is a simulation with mock results
    setTimeout(() => {
        const mockAISuggestions = [
            "Based on similar cases, try breaking the problem down into smaller steps.",
            "AI recommendation: Consider consulting with a professional in this field for personalized advice.",
            "Many people facing this issue found success by following a structured approach over time.",
            "Recent studies suggest that combining multiple strategies often yields better results for this type of problem."
        ];
        
        displayAISuggestions(mockAISuggestions);
    }, 1500);
}

function displayAISuggestions(suggestions) {
    searchResultsContainer.innerHTML = '';
    
    suggestions.forEach((suggestion, index) => {
        const suggestionElement = document.createElement('div');
        suggestionElement.className = 'search-result-item';
        suggestionElement.innerHTML = `
            <div class="d-flex">
                <span class="badge bg-primary me-2">${index + 1}</span>
                <p>${suggestion}</p>
            </div>
        `;
        searchResultsContainer.appendChild(suggestionElement);
    });
}

//Dissable right-click
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});

