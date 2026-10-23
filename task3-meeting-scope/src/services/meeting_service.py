from src.services.knowledge import query_knowledge


def analyze_meeting(transcript: str) -> dict:
    """
    Convert a meeting transcript into a simple project scope.

    The workflow:
    1. Extract basic requirements from the transcript.
    2. Query Task 1 Knowledge Brain.
    3. Produce a feasibility assessment.
    4. Produce scope and estimate.
    """

    lines = [
        line.strip()
        for line in transcript.splitlines()
        if line.strip()
    ]

    requirements = []

    for line in lines:
        lowered = line.lower()

        if any(
            keyword in lowered
            for keyword in [
                "need",
                "want",
                "require",
                "should",
                "must",
                "feature",
                "system",
            ]
        ):
            requirements.append(line)

    if not requirements:
        requirements = lines[:5]

    knowledge_question = (
        "Based on these project requirements, what relevant "
        "product or technical knowledge is available?\n\n"
        + "\n".join(requirements)
    )

    knowledge = query_knowledge(knowledge_question)

    scope_items = [
        "Requirement analysis",
        "Backend/API implementation",
        "Knowledge integration",
        "Testing and validation",
    ]

    estimate = {
        "low_hours": 16,
        "high_hours": 32,
        "assumption": "Estimate is based on a small MVP implementation."
    }

    return {
        "requirements": requirements,
        "knowledge": knowledge,
        "feasibility": {
            "status": "Feasible",
            "reason": (
                "The requested functionality can be implemented as an "
                "MVP using the existing backend and knowledge API."
            ),
        },
        "scope": scope_items,
        "estimate": estimate,
        "proposal": {
            "summary": (
                "Build a small MVP based on the requirements identified "
                "during the meeting."
            ),
            "deliverables": scope_items,
        },
    }
