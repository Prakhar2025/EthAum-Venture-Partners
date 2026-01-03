"""EthAum AI - Launches Router."""

from fastapi import APIRouter, HTTPException

from schemas.launch import LaunchCreate, LaunchResponse

router = APIRouter()

# In-memory storage
LAUNCHES: list[dict] = []


@router.post("/", response_model=LaunchResponse)
def create_launch(launch: LaunchCreate) -> LaunchResponse:
    """Create a new product launch."""
    new_launch = {
        "id": len(LAUNCHES) + 1,
        "product_id": launch.product_id,
        "tagline": launch.tagline,
        "description": launch.description,
        "upvotes": 0,
    }
    LAUNCHES.append(new_launch)

    return LaunchResponse(
        id=new_launch["id"],
        product_id=new_launch["product_id"],
        upvotes=new_launch["upvotes"],
    )


@router.post("/{launch_id}/upvote")
def upvote_launch(launch_id: int) -> dict:
    """Increment upvotes for a launch."""
    for launch in LAUNCHES:
        if launch["id"] == launch_id:
            launch["upvotes"] += 1
            return {"id": launch_id, "upvotes": launch["upvotes"]}
    raise HTTPException(status_code=404, detail="Launch not found")


@router.get("/leaderboard")
def get_leaderboard() -> list[dict]:
    """Get launches sorted by upvotes (descending)."""
    sorted_launches = sorted(LAUNCHES, key=lambda x: x["upvotes"], reverse=True)
    return [
        {"id": l["id"], "product_id": l["product_id"], "tagline": l["tagline"], "upvotes": l["upvotes"]}
        for l in sorted_launches
    ]
