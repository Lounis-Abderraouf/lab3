        // State management
        let currentPoll = null;
        let hasVoted = false;

        // Generate unique poll ID
        function generatePollId() {
            return 'POLL-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        }

        // Get elements
        const createView = document.getElementById('createView');
        const voteView = document.getElementById('voteView');
        const resultsView = document.getElementById('resultsView');
        const createPollForm = document.getElementById('createPollForm');
        const optionsList = document.getElementById('optionsList');
        const addOptionBtn = document.getElementById('addOptionBtn');
        const voteForm = document.getElementById('voteForm');
        const newPollBtn = document.getElementById('newPollBtn');
        const createAnotherBtn = document.getElementById('createAnotherBtn');

        // Switch between views
        function showView(view) {
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            view.classList.add('active');
        }

        // Add option input
        addOptionBtn.addEventListener('click', () => {
            const optionCount = optionsList.children.length + 1;
            const optionItem = document.createElement('div');
            optionItem.className = 'option-item';
            optionItem.innerHTML = `
                <input type="text" class="option-input" placeholder="Option ${optionCount}" required>
                <button type="button" class="btn-remove">✕</button>
            `;
            
            // Remove option handler
            optionItem.querySelector('.btn-remove').addEventListener('click', () => {
                if (optionsList.children.length > 2) {
                    optionItem.remove();
                }
            });
            
            optionsList.appendChild(optionItem);
        });

        // Create poll handler
        createPollForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const question = document.getElementById('pollQuestion').value.trim();
            const optionInputs = document.querySelectorAll('.option-input');
            const options = Array.from(optionInputs)
                .map(input => input.value.trim())
                .filter(val => val !== '');

            // Validation
            if (!question) {
                document.getElementById('questionError').classList.add('show');
                return;
            }
            if (options.length < 2) {
                document.getElementById('optionsError').classList.add('show');
                return;
            }

            // Create poll object
            currentPoll = {
                id: generatePollId(),
                question: question,
                options: options.map(opt => ({
                    text: opt,
                    votes: 0
                }))
            };

            // Reset form
            createPollForm.reset();
            document.querySelectorAll('.error').forEach(err => err.classList.remove('show'));
            
            // Remove extra options
            while (optionsList.children.length > 2) {
                optionsList.lastChild.remove();
            }

            // Check if user already voted
            const votedPollId = localStorage.getItem('votedPollId');
            hasVoted = false;

            // Show vote view
            displayVoteView();
        });

        // Display vote view
        function displayVoteView() {
            document.getElementById('pollIdDisplay').textContent = currentPoll.id;
            document.getElementById('voteQuestion').textContent = currentPoll.question;
            
            const voteOptions = document.getElementById('voteOptions');
            voteOptions.innerHTML = '';
            
            currentPoll.options.forEach((option, index) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'vote-option';
                optionDiv.innerHTML = `
                    <input type="radio" name="vote" value="${index}" id="option${index}" required>
                    <label for="option${index}" style="cursor: pointer; flex: 1;">${option.text}</label>
                `;
                
                optionDiv.addEventListener('click', () => {
                    document.getElementById(`option${index}`).checked = true;
                    document.querySelectorAll('.vote-option').forEach(opt => opt.classList.remove('selected'));
                    optionDiv.classList.add('selected');
                });
                
                voteOptions.appendChild(optionDiv);
            });

            showView(voteView);
        }

        // Vote form handler
        voteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Check if already voted
            if (hasVoted) {
                alert('You have already voted on this poll!');
                return;
            }

            const selectedOption = document.querySelector('input[name="vote"]:checked');
            if (!selectedOption) return;

            const optionIndex = parseInt(selectedOption.value);
            currentPoll.options[optionIndex].votes++;
            
            // Mark as voted
            hasVoted = true;
            localStorage.setItem('votedPollId', currentPoll.id);

            // Show results
            displayResults();
        });

        // Display results
        function displayResults() {
            document.getElementById('pollIdResults').textContent = currentPoll.id;
            document.getElementById('resultsQuestion').textContent = currentPoll.question;
            
            const totalVotes = currentPoll.options.reduce((sum, opt) => sum + opt.votes, 0);
            const resultsContainer = document.getElementById('resultsContainer');
            resultsContainer.innerHTML = '';

            currentPoll.options.forEach(option => {
                const percentage = totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(1) : 0;
                
                const resultDiv = document.createElement('div');
                resultDiv.className = 'result-option';
                resultDiv.innerHTML = `
                    <div class="result-bar" style="width: ${percentage}%"></div>
                    <div class="result-content">
                        <span class="result-text">${option.text}</span>
                        <div class="result-stats">
                            <span class="result-percentage">${percentage}%</span>
                            <span>${option.votes} vote${option.votes !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                `;
                resultsContainer.appendChild(resultDiv);
            });

            document.getElementById('totalVotes').textContent = `Total votes: ${totalVotes}`;
            showView(resultsView);
        }

        // New poll buttons
        newPollBtn.addEventListener('click', () => {
            currentPoll = null;
            hasVoted = false;
            localStorage.removeItem('votedPollId');
            showView(createView);
        });

        createAnotherBtn.addEventListener('click', () => {
            currentPoll = null;
            hasVoted = false;
            localStorage.removeItem('votedPollId');
            showView(createView);
        });

        // Remove option buttons for initial options
        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (optionsList.children.length > 2) {
                    e.target.closest('.option-item').remove();
                }
            });
        });
