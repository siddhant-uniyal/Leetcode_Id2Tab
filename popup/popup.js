const API_URL = "https://leetcode.com/graphql"
const PROBLEM_URL = "https://leetcode.com/problems/"

const createQuery = (problemId) => ({
    "query" : `query getProblem($categorySlug: String, $skip: Int, $filters: QuestionListFilterInput){
                    problemsetQuestionList: questionList(categorySlug: $categorySlug skip: $skip filters: $filters){
                        total: totalNum 
                        questions: data
                                {
                                    questionFrontendId
                                    titleSlug 
                                }
                    }
                }`,
    "variables": `{"categorySlug":"all-code-essentials","skip":0,"filters":{"searchKeywords":"${problemId}"}}`
    }
)

const generateURL = async (problemId) => {
    try{
        const response = await fetch(API_URL , {
            method : "POST",
            body : JSON.stringify(createQuery(problemId)),
            headers : {
                "Content-type" : "application/json; charset=UTF-8"
            }
        })

        if(!response.ok){
            throw new Error(`error while fetching : ${response.status}`)
        }

        const data = await response.json().catch(err => {
            throw new Error(`failed to parse into JSON : ${err.message}`)
        })

        const questionList = data["data"]["problemsetQuestionList"]["questions"]

        if(!questionList || questionList.length == 0){
            throw new Error("problem id doesn't exist , please try again")
        }

        const problem = questionList.find(question => question["questionFrontendId"] === problemId)

        const problemSlug = problem["titleSlug"]

        return PROBLEM_URL + problemSlug
    }
    catch(err){
        reportError(err)
        return ""
    }
}   

const reportError = (error) => {
    console.error(error.message)
    errorContentDiv.classList.remove("hidden")
    errorContentDiv.textContent = error.message
}


const input = document.getElementById("id-input-box")
const button = document.getElementById("id-input-button")
const errorContentDiv = document.querySelector("#error-content-div")

document.addEventListener("DOMContentLoaded", () => {
    input.focus()
    input.addEventListener("keydown" , (e) => {
        if(e.key === "Enter"){
            button.click()  
        }
    })
});

button.addEventListener("click" , async () => {

    errorContentDiv.classList.add("hidden")

    const problemId = input.value

    if(!problemId || !(/^[1-9][0-9]*$/g.test(problemId))){
        reportError({ message : "invalid problem id , must be natural number"})
        return
    }

    const url = await generateURL(problemId)

    if(url){
        browser.tabs.create({
            url : url
        })
    }

    window.close()
})


