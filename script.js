document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const bearerTokenInput = document.getElementById('bearer-token');
    const saveTokenBtn = document.getElementById('save-token');
    const clearTokenBtn = document.getElementById('clear-token');
    const tokenStatus = document.getElementById('token-status');
    
    const fetchCustomersBtn = document.getElementById('fetch-customers');
    const customerSelect = document.getElementById('customer-select');
    
    const fetchContractsBtn = document.getElementById('fetch-contracts');
    const contractSelect = document.getElementById('contract-select');
    
    const fetchProductsBtn = document.getElementById('fetch-products');
    const productSelect = document.getElementById('product-select');
    
    const startingAtInput = document.getElementById('starting-at');
    const overrideStartingAtInput = document.getElementById('override-starting-at');
    
    const modelNameInput = document.getElementById('model-name');
    const priceInput = document.getElementById('price');
    
    const submitAmendmentBtn = document.getElementById('submit-amendment');
    const resultOutput = document.getElementById('result-output');

    // API Base URL
    const API_BASE_URL = 'https://api.metronome.com/v1';

    // Initialize date pickers
    flatpickr(startingAtInput, {
        enableTime: true,
        dateFormat: "Y-m-d H:i:S",
        time_24hr: true,
        defaultDate: "2025-01-25 00:00:00"
    });

    flatpickr(overrideStartingAtInput, {
        enableTime: true,
        dateFormat: "Y-m-d H:i:S",
        time_24hr: true,
        defaultDate: "2025-01-25 00:00:00"
    });
    
    // Set default values from the example
    modelNameInput.value = "parasail-qwen2-vl-72b-instruct";
    priceInput.value = "45";

    // Check for saved token on page load
    checkSavedToken();

    // Event Listeners
    saveTokenBtn.addEventListener('click', saveToken);
    clearTokenBtn.addEventListener('click', clearToken);
    fetchCustomersBtn.addEventListener('click', fetchCustomers);
    fetchContractsBtn.addEventListener('click', fetchContracts);
    fetchProductsBtn.addEventListener('click', fetchProducts);
    submitAmendmentBtn.addEventListener('click', submitAmendment);

    // Token Management Functions
    function saveToken() {
        const token = bearerTokenInput.value.trim();
        if (token) {
            localStorage.setItem('metronomeToken', token);
            tokenStatus.textContent = 'Token saved!';
            tokenStatus.className = 'success';
            setTimeout(() => {
                tokenStatus.textContent = '';
            }, 3000);
            checkSavedToken();
        } else {
            tokenStatus.textContent = 'Please enter a token';
            tokenStatus.className = 'error';
        }
    }

    function clearToken() {
        localStorage.removeItem('metronomeToken');
        bearerTokenInput.value = '';
        tokenStatus.textContent = 'Token cleared!';
        tokenStatus.className = 'success';
        setTimeout(() => {
            tokenStatus.textContent = '';
        }, 3000);
        checkSavedToken();
        
        // Reset all selects
        customerSelect.innerHTML = '<option value="">Select a customer</option>';
        customerSelect.disabled = true;
        contractSelect.innerHTML = '<option value="">Select a contract</option>';
        contractSelect.disabled = true;
        productSelect.innerHTML = '<option value="">Select a product</option>';
        productSelect.disabled = true;
    }

    function checkSavedToken() {
        const savedToken = localStorage.getItem('metronomeToken');
        if (savedToken) {
            bearerTokenInput.value = savedToken;
            fetchCustomersBtn.disabled = false;
        } else {
            fetchCustomersBtn.disabled = true;
        }
    }

    function getAuthHeader() {
        const token = localStorage.getItem('metronomeToken');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    // API Functions
    async function fetchCustomers() {
        try {
            resultOutput.textContent = 'Fetching customers...';
            
            const response = await fetch(`${API_BASE_URL}/customers`, {
                method: 'GET',
                headers: getAuthHeader()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            
            // Clear existing options
            customerSelect.innerHTML = '<option value="">Select a customer</option>';
            
            // Add customer options
            data.customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.id;
                option.textContent = `${customer.name} (${customer.id})`;
                customerSelect.appendChild(option);
            });
            
            customerSelect.disabled = false;
            fetchContractsBtn.disabled = true;
            
            resultOutput.textContent = `Successfully fetched ${data.customers.length} customers.`;
        } catch (error) {
            resultOutput.textContent = `Error fetching customers: ${error.message}`;
            console.error('Error fetching customers:', error);
        }
    }

    async function fetchContracts() {
        const customerId = customerSelect.value;
        if (!customerId) {
            resultOutput.textContent = 'Please select a customer first.';
            return;
        }

        try {
            resultOutput.textContent = 'Fetching contracts...';
            
            const response = await fetch(`${API_BASE_URL}/customers/${customerId}/contracts`, {
                method: 'GET',
                headers: getAuthHeader()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            
            // Clear existing options
            contractSelect.innerHTML = '<option value="">Select a contract</option>';
            
            // Add contract options
            data.contracts.forEach(contract => {
                const option = document.createElement('option');
                option.value = contract.id;
                option.textContent = `${contract.id} (${new Date(contract.starting_at).toLocaleDateString()})`;
                contractSelect.appendChild(option);
            });
            
            contractSelect.disabled = false;
            fetchProductsBtn.disabled = false;
            
            resultOutput.textContent = `Successfully fetched ${data.contracts.length} contracts.`;
        } catch (error) {
            resultOutput.textContent = `Error fetching contracts: ${error.message}`;
            console.error('Error fetching contracts:', error);
        }
    }

    async function fetchProducts() {
        try {
            resultOutput.textContent = 'Fetching products...';
            
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'GET',
                headers: getAuthHeader()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            
            // Clear existing options
            productSelect.innerHTML = '<option value="">Select a product</option>';
            
            // Add product options
            data.products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = `${product.name} (${product.id})`;
                productSelect.appendChild(option);
            });
            
            productSelect.disabled = false;
            
            resultOutput.textContent = `Successfully fetched ${data.products.length} products.`;
        } catch (error) {
            resultOutput.textContent = `Error fetching products: ${error.message}`;
            console.error('Error fetching products:', error);
        }
    }

    // Format date to ISO string with Z
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString();
    }

    async function submitAmendment() {
        // Validate required fields
        const customerId = customerSelect.value;
        const contractId = contractSelect.value;
        const startingAt = startingAtInput.value;
        const overrideStartingAt = overrideStartingAtInput.value;
        const productId = productSelect.value;
        const modelName = modelNameInput.value;
        const price = priceInput.value;

        if (!customerId || !contractId || !startingAt || !overrideStartingAt || !productId || !modelName || !price) {
            resultOutput.textContent = 'Please fill in all required fields.';
            return;
        }

        try {
            resultOutput.textContent = 'Submitting amendment...';
            
            const payload = {
                customer_id: customerId,
                contract_id: contractId,
                starting_at: formatDate(startingAt),
                overrides: [{
                    starting_at: formatDate(overrideStartingAt),
                    type: "overwrite",
                    override_specifiers: [{
                        product_id: productId,
                        pricing_group_values: {
                            modelName: modelName
                        }
                    }],
                    overwrite_rate: {
                        rate_type: "flat",
                        price: Number(price)
                    }
                }]
            };

            const response = await fetch(`${API_BASE_URL}/contracts/amend`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(`${response.status}: ${JSON.stringify(data)}`);
            }

            resultOutput.textContent = `Amendment successful!\n\nResponse:\n${JSON.stringify(data, null, 2)}`;
        } catch (error) {
            resultOutput.textContent = `Error submitting amendment: ${error.message}`;
            console.error('Error submitting amendment:', error);
        }
    }

    // Event listener for customer selection to enable contract fetch
    customerSelect.addEventListener('change', function() {
        if (this.value) {
            fetchContractsBtn.disabled = false;
        } else {
            fetchContractsBtn.disabled = true;
            contractSelect.innerHTML = '<option value="">Select a contract</option>';
            contractSelect.disabled = true;
        }
    });
});